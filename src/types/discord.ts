// This would have been a ballache
// Thankfully this website exists: https://quicktype.io/typescript
// Types MAY have some errors, but I'll fix them as I go

export interface SessionInfo {
    v: number;
    users: UserElement[];
    user_settings_proto: string;
    user_settings: UserSettings;
    user_guild_settings: UserGuildSettings;
    user: DiscordUser;
    tutorial: null;
    sessions: Session[];
    session_type: string;
    session_id: string;
    resume_gateway_url: string;
    relationships: Relationship[];
    read_state: ReadState;
    private_channels: PrivateChannel[];
    merged_members: Array<MergedMember[]>;
    guilds: Guild[];
    guild_join_requests: any[];
    geo_ordered_rtc_regions: string[];
    friend_suggestion_count: number;
    country_code: string;
    consents: Consents;
    connected_accounts: any[];
    auth_session_id_hash: string;
    api_code_version: number;
    analytics_token: string;
    _trace: string[];
}

export interface Consents {
    personalization: {
        consented: boolean;
    }
}

export interface Guild {
    afk_channel_id: null | string;
    explicit_content_filter: number;
    preferred_locale: string;
    guild_hashes: GuildHashes;
    max_video_channel_users: number;
    joined_at: Date;
    features: string[];
    default_message_notifications: number;
    banner: null | string;
    roles: Role[];
    premium_progress_bar_enabled: boolean;
    vanity_url_code: null | string;
    system_channel_flags: number;
    id: string;
    icon: string;
    stickers: Sticker[];
    nsfw_level: number;
    afk_timeout: number;
    channels: Channel[];
    public_updates_channel_id: string;
    emojis: Emoji[];
    max_stage_video_channel_users: number;
    stage_instances: any[];
    threads: any[];
    application_id: null;
    region: string;
    guild_scheduled_events: GuildScheduledEvent[];
    hub_type: null;
    splash: null | string;
    lazy: boolean;
    description: null | string;
    rules_channel_id: string;
    member_count: number;
    owner_id: string;
    nsfw: boolean;
    large: boolean;
    premium_tier: number;
    mfa_level: number;
    premium_subscription_count: number;
    system_channel_id: string;
    name: string;
    verification_level: number;
    max_members: number;
    discovery_splash: null | string;
    application_command_counts: { [key: string]: number };
}

export interface GuildSummary {
    id: string;
    name: string;
    icon: string;
    owner: boolean;
    permissions: string;
    features: string[];
}

export interface Channel {
    version?: number;
    type: ChannelType;
    topic?: null | string;
    rate_limit_per_user?: number;
    position?: number;
    permission_overwrites?: PermissionOverwrite[];
    parent_id?: null | string;
    nsfw?: boolean;
    name: string;
    last_message_id?: null | string;
    id?: string;
    flags?: number;
    last_pin_timestamp?: Date | null;
    user_limit?: number;
    rtc_region?: null | string;
    bitrate?: number;
    default_thread_rate_limit_per_user?: number;
    template?: string;
    default_sort_order?: null;
    default_reaction_emoji?: DefaultReactionEmoji | null;
    default_auto_archive_duration?: number;
    available_tags?: AvailableTag[];
}

export interface AvailableTag {
    name: string;
    moderated: boolean;
    id: string;
    emoji_name: null | string;
    emoji_id: null | string;
}

export interface DefaultReactionEmoji {
    emoji_name: string;
    emoji_id: null;
}

export enum PermissionOverrideType {
    ROLE = 0,
    MEMBER = 1
}

export enum ChannelType {
    GUILD_TEXT = 0,
    DM = 1,
    GUILD_VOICE = 2,
    GROUP_DM = 3,
    GUILD_CATEGORY = 4,
    GUILD_NEWS = 5,
    GUILD_STORE = 6,
    GUILD_NEWS_THREAD = 10,
    GUILD_PUBLIC_THREAD = 11,
    GUILD_PRIVATE_THREAD = 12,
    GUILD_STAGE_VOICE = 13
}

export interface PermissionOverwrite {
    type: PermissionOverrideType;
    id: string;
    deny: string;
    allow: string;
}

export interface Emoji {
    version?: number;
    roles?: string[];
    require_colons?: boolean;
    name: string;
    managed?: boolean;
    id?: string;
    available?: boolean;
    animated?: boolean;
}

export interface GuildHashes {
    version: number;
    roles: Channels;
    metadata: Channels;
    channels: Channels;
}

export interface Channels {
    omitted: boolean;
    hash: string;
}

export interface GuildScheduledEvent {
    status: number;
    sku_ids: any[];
    scheduled_start_time: Date;
    scheduled_end_time: Date;
    privacy_level: number;
    name: string;
    image: null;
    id: string;
    guild_id: string;
    entity_type: number;
    entity_metadata: EntityMetadata;
    entity_id: null;
    description: string;
    creator_id: string;
    channel_id: null;
}

export interface EntityMetadata {
    location: string;
}

export interface Role {
    version?: number;
    unicode_emoji?: null | string;
    tags?: Tags;
    position?: number;
    permissions?: string;
    name: string;
    mentionable: boolean;
    managed?: boolean;
    id?: string;
    icon?: null | string;
    hoist: boolean;
    flags?: number;
    color?: number;
}

export interface Tags {
    integration_id?: string;
    bot_id?: string;
    premium_subscriber?: null;
}

export interface Sticker {
    version: number;
    type: number;
    tags: string;
    name: string;
    id: string;
    guild_id: string;
    format_type: number;
    description: any;
    available: boolean;
    asset: string;
}

export interface MergedMember {
    user_id: string;
    roles: string[];
    premium_since: null;
    pending: boolean;
    nick: null;
    mute: boolean;
    joined_at: Date;
    flags: number;
    deaf: boolean;
    communication_disabled_until: null;
    avatar: null;
}

export interface PrivateChannel {
    type: number;
    recipient_ids: string[];
    last_message_id: string;
    id: string;
    flags: number;
    last_pin_timestamp?: Date;
    is_spam?: boolean;
    is_message_request_timestamp?: Date;
    is_message_request?: boolean;
}

export interface ReadState {
    version: number;
    partial: boolean;
    entries: ReadStateEntry[];
}

export interface ReadStateEntry {
    mention_count: number;
    last_pin_timestamp: Date;
    last_message_id: number | string;
    id: string;
}

export interface Relationship {
    user_id: string;
    type: number;
    nickname: null;
    id: string;
    since?: Date;
}

export interface Session {
    status: string;
    session_id: string;
    client_info: ClientInfo;
    activities: any[];
}

export interface ClientInfo {
    version: number;
    os: string;
    client: string;
}

export interface DiscordUserFull {
    verified: boolean;
    username: string;
    purchased_flags: number;
    public_flags: number;
    premium_type: number;
    premium: boolean;
    phone: string;
    nsfw_allowed: boolean;
    mobile: boolean;
    mfa_enabled: boolean;
    id: string;
    flags: number;
    email: string;
    discriminator: string;
    desktop: boolean;
    bio: string;
    banner_color: string;
    banner: null;
    avatar_decoration: null;
    avatar: string;
    accent_color: number;
}

export interface UserGuildSettings {
    version: number;
    partial: boolean;
    entries: UserGuildSettingsEntry[];
}

export interface UserGuildSettingsEntry {
    version: number;
    suppress_roles: boolean;
    suppress_everyone: boolean;
    notify_highlights: number;
    muted: boolean;
    mute_scheduled_events: boolean;
    mute_config: MuteConfig | null;
    mobile_push: boolean;
    message_notifications: number;
    hide_muted_channels: boolean;
    guild_id: null | string;
    flags: number;
    channel_overrides: ChannelOverride[];
}

export interface ChannelOverride {
    muted: boolean;
    mute_config: MuteConfig | null;
    message_notifications: number;
    collapsed: boolean;
    channel_id: string;
}

export interface MuteConfig {
    selected_time_window: number;
    end_time: Date | null;
}

export interface UserSettings {
    detect_platform_accounts: boolean;
    animate_stickers: number;
    inline_attachment_media: boolean;
    status: string;
    message_display_compact: boolean;
    view_nsfw_guilds: boolean;
    timezone_offset: number;
    enable_tts_command: boolean;
    disable_games_tab: boolean;
    stream_notifications_enabled: boolean;
    animate_emoji: boolean;
    guild_folders: GuildFolder[];
    activity_joining_restricted_guild_ids: any[];
    friend_source_flags: FriendSourceFlags;
    convert_emoticons: boolean;
    afk_timeout: number;
    passwordless: boolean;
    contact_sync_enabled: boolean;
    gif_auto_play: boolean;
    custom_status: null;
    native_phone_integration_enabled: boolean;
    allow_accessibility_detection: boolean;
    friend_discovery_flags: number;
    show_current_game: boolean;
    restricted_guilds: any[];
    developer_mode: boolean;
    view_nsfw_commands: boolean;
    render_reactions: boolean;
    locale: string;
    render_embeds: boolean;
    inline_embed_media: boolean;
    default_guilds_restricted: boolean;
    explicit_content_filter: number;
    activity_restricted_guild_ids: any[];
    theme: string;
}

export interface FriendSourceFlags {
    all: boolean;
}

export interface GuildFolder {
    name: null;
    id: null;
    guild_ids: string[];
    color: null;
}

export interface UserElement {
    username: string;
    public_flags: number;
    id: string;
    discriminator: string;
    bot?: boolean;
    avatar_decoration?: null;
    avatar: null | string;
}

export interface Message {
    id: string;
    type: number;
    content: string;
    channel_id: string;
    author: Author;
    attachments: Attachment[];
    embeds: any[];
    mentions: Author[];
    mention_roles: any[];
    pinned: boolean;
    mention_everyone: boolean;
    tts: boolean;
    timestamp: Date;
    edited_timestamp: null;
    flags: number;
    components: any[];
    message_reference?: MessageReference;
    referenced_message?: Message;
}

export interface Attachment {
    id: string;
    filename: string;
    size: number;
    url: string;
    proxy_url: string;
    width: number;
    height: number;
    content_type: string;
}

export interface Author {
    id: string;
    username: string;
    avatar: string;
    avatar_decoration: null;
    discriminator: string;
    public_flags: number;
}

export interface MessageReference {
    channel_id: string;
    guild_id: string;
    message_id: string;
}

export interface JoinReponse {
    code: string;
    type: number;
    expires_at: Date;
    guild: GuildJoinInfo;
    channel: JoinChannel;
    inviter: Inviter;
    uses: number;
    max_uses: number;
    max_age: number;
    temporary: boolean;
    created_at: Date;
}

export interface JoinChannel {
    id: string;
    name: string;
    type: number;
}

export interface GuildJoinInfo {
    id: string;
    name: string;
    splash: null;
    banner: null;
    description: null;
    icon: null;
    features: any[];
    verification_level: number;
    vanity_url_code: null;
    premium_subscription_count: number;
    nsfw: boolean;
    nsfw_level: number;
}

export interface Inviter {
    id: string;
    username: string;
    avatar: string;
    avatar_decoration: null;
    discriminator: string;
    public_flags: number;
}

export interface DiscordUserProfile {
    user: DiscordUser;
    connected_accounts: any[];
    premium_since: null;
    premium_type: null;
    premium_guild_since: null;
    profile_themes_experiment_bucket: number;
    mutual_guilds: MutualGuild[];
    user_profile: UserProfileClass;
}

export interface MutualGuild {
    id: string;
    nick: null;
}

export interface DiscordUser {
    id: string;
    username: string;
    avatar: string;
    avatar_decoration: null;
    discriminator: string;
    public_flags: number;
    flags: number;
    banner: null;
    banner_color: null;
    accent_color: null;
    bio: string;
}

export interface UserProfileClass {
    bio: string;
    accent_color: null;
}

export interface PaymentSource {
    id: string;
    type: number;
    invalid: boolean;
    flags: number;
    screen_status: number;
    brand: string;
    last_4: string;
    expires_month: number;
    expires_year: number;
    billing_address: BillingAddress;
    country: string;
    payment_gateway: number;
    default: boolean;
}

export interface BillingAddress {
    name: string;
    line_1: string;
    line_2: null;
    city: string;
    state: string;
    country: string;
    postal_code: string;
}

export interface CountryCode {
    country_code: string;
}

export interface Subscription {
    id: string;
    type: number;
    created_at: Date;
    canceled_at: null;
    current_period_start: Date;
    current_period_end: Date;
    status: number;
    payment_source_id: string;
    payment_gateway: null;
    payment_gateway_plan_id: null;
    payment_gateway_subscription_id: null;
    items: SubscriptionItem[];
    currency: string;
    streak_started_at: Date;
}

export interface SubscriptionItem {
    id: string;
    plan_id: string;
    quantity: number;
}
