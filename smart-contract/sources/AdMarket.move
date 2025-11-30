module admarket::AdMarket {
    use std::string;
    use std::signer;
    use std::table;
    use std::vector;

    //
    // ERRORS
    //
    const E_NOT_AUTHORIZED: u64 = 1;
    const E_VIDEO_NOT_FOUND: u64 = 2;
    const E_CAMPAIGN_NOT_FOUND: u64 = 3;
    const E_INSUFFICIENT_FUNDS: u64 = 4;

    //
    // USER ROLES
    //
    struct UserRole has store, copy, drop {
        is_creator: bool,
        is_advertiser: bool,
        is_consumer: bool
    }

    struct RolesTable has key {
        table: table::Table<address, UserRole>
    }

    public entry fun init_roles(admin: &signer) {
        move_to(admin, RolesTable { table: table::new<address, UserRole>() });
    }

    public entry fun register_creator(user: &signer) {
        let addr = signer::address_of(user);
        let roles = borrow_global_mut<RolesTable>(@admarket);

        if (table::contains(&roles.table, addr)) {
            let r = table::borrow_mut(&mut roles.table, addr);
            r.is_creator = true;
            return;
        };

        table::add(&mut roles.table, addr, UserRole {
            is_creator: true,
            is_advertiser: false,
            is_consumer: false
        });
    }

    public entry fun register_advertiser(user: &signer) {
        let addr = signer::address_of(user);
        let roles = borrow_global_mut<RolesTable>(@admarket);

        if (table::contains(&roles.table, addr)) {
            let r = table::borrow_mut(&mut roles.table, addr);
            r.is_advertiser = true;
            return;
        };

        table::add(&mut roles.table, addr, UserRole {
            is_creator: false,
            is_advertiser: true,
            is_consumer: false
        });
    }

    public entry fun register_consumer(user: &signer) {
        let addr = signer::address_of(user);
        let roles = borrow_global_mut<RolesTable>(@admarket);

        if (table::contains(&roles.table, addr)) {
            let r = table::borrow_mut(&mut roles.table, addr);
            r.is_consumer = true;
            return;
        };

        table::add(&mut roles.table, addr, UserRole {
            is_creator: false,
            is_advertiser: false,
            is_consumer: true
        });
    }

    //
    // VIDEO METADATA
    //
    struct VideoMetadata has store {
        cid: string::String,
        title: string::String,
        description: string::String,
        creator: address
    }

    struct VideosTable has key {
        table: table::Table<u64, VideoMetadata>,
        next_id: u64
    }

    public entry fun init_videos(admin: &signer) {
        move_to(admin, VideosTable {
            table: table::new<u64, VideoMetadata>(),
            next_id: 0
        });
    }

    public entry fun upload_video(
        creator: &signer,
        cid: string::String,
        title: string::String,
        description: string::String
    ) {
        let addr = signer::address_of(creator);

        let roles = borrow_global<RolesTable>(@admarket);
        let role = table::borrow(&roles.table, addr);
        assert!(role.is_creator, E_NOT_AUTHORIZED);

        let videos = borrow_global_mut<VideosTable>(@admarket);
        let id = videos.next_id;
        videos.next_id = id + 1;

        table::add(&mut videos.table, id, VideoMetadata {
            cid,
            title,
            description,
            creator: addr
        });
    }

    //
    // CAMPAIGNS (accounting only)
    //
    struct Campaign has store {
        advertiser: address,
        video_id: u64,
        budget: u64,
        spent: u64,
        reward_per_second: u64
    }

    struct CampaignsTable has key {
        table: table::Table<u64, Campaign>,
        next_id: u64
    }

    public entry fun init_campaigns(admin: &signer) {
        move_to(admin, CampaignsTable { table: table::new<u64, Campaign>(), next_id: 0 });
    }

    public entry fun create_campaign(
        advertiser: &signer,
        video_id: u64,
        budget: u64,
        reward_per_second: u64
    ) {
        let addr = signer::address_of(advertiser);
        let roles = borrow_global<RolesTable>(@admarket);
        let role = table::borrow(&roles.table, addr);
        assert!(role.is_advertiser, E_NOT_AUTHORIZED);

        let videos = borrow_global<VideosTable>(@admarket);
        assert!(table::contains(&videos.table, video_id), E_VIDEO_NOT_FOUND);

        let campaigns = borrow_global_mut<CampaignsTable>(@admarket);
        let id = campaigns.next_id;
        campaigns.next_id = id + 1;

        table::add(&mut campaigns.table, id, Campaign {
            advertiser: addr,
            video_id,
            budget,
            spent: 0,
            reward_per_second
        });
    }

    //
    // ATTESTERS
    //
    struct AttesterList has key {
        list: vector<address>
    }

    public entry fun init_attesters(admin: &signer) {
        move_to(admin, AttesterList { list: vector::empty<address>() });
    }

    public entry fun add_attester(admin: &signer, new_addr: address) {
        let admin_addr = signer::address_of(admin);
        assert!(admin_addr == @admarket, E_NOT_AUTHORIZED);

        let attesters = borrow_global_mut<AttesterList>(@admarket);
        vector::push_back(&mut attesters.list, new_addr);
    }

    fun is_attester_internal(addr: address): bool {
        let attesters = borrow_global<AttesterList>(@admarket);
        let list_ref = &attesters.list;
        let len = vector::length(list_ref);

        let i: u64 = 0;
        while (i < len) {
            let entry = *vector::borrow(list_ref, i);
            if (entry == addr) {
                return true;
            };
            i = i + 1;
        };

        false
    }

    //
    // CREATOR BALANCES
    //
    struct CreatorBalances has key {
        table: table::Table<address, u64>
    }

    public entry fun init_creator_balances(admin: &signer) {
        move_to(admin, CreatorBalances { table: table::new<address, u64>() });
    }

    public entry fun record_watch_time(
        attester: &signer,
        campaign_id: u64,
        seconds: u64
    ) {
        let att_addr = signer::address_of(attester);
        assert!(is_attester_internal(att_addr), E_NOT_AUTHORIZED);

        let campaigns = borrow_global_mut<CampaignsTable>(@admarket);
        assert!(table::contains(&campaigns.table, campaign_id), E_CAMPAIGN_NOT_FOUND);

        let campaign = table::borrow_mut(&mut campaigns.table, campaign_id);
        let reward = campaign.reward_per_second * seconds;

        assert!(campaign.spent + reward <= campaign.budget, E_INSUFFICIENT_FUNDS);
        campaign.spent = campaign.spent + reward;

        let videos = borrow_global<VideosTable>(@admarket);
        let video = table::borrow(&videos.table, campaign.video_id);
        let creator = video.creator;

        let balances = borrow_global_mut<CreatorBalances>(@admarket);
        if (table::contains(&balances.table, creator)) {
            let cur = table::borrow_mut(&mut balances.table, creator);
            *cur = *cur + reward;
        } else {
            table::add(&mut balances.table, creator, reward);
        };
    }

    public entry fun withdraw_rewards(creator: &signer) {
        let addr = signer::address_of(creator);
        let balances = borrow_global_mut<CreatorBalances>(@admarket);

        if (!table::contains(&balances.table, addr)) {
            return;
        };

        let reward_ref = table::borrow_mut(&mut balances.table, addr);
        let amount = *reward_ref;

        if (amount == 0) {
            return;
        };

        let zero: u64 = 0;
        *reward_ref = zero;
    }

    public fun get_creator_balance(addr: address): u64 {
        let balances = borrow_global<CreatorBalances>(@admarket);
        if (!table::contains(&balances.table, addr)) {
            0
        } else {
            *table::borrow(&balances.table, addr)
        }
    }
}
