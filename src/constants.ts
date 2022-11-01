export const Constants = {
    // Headers that are merged with every request
    defaultHeaders: {
        'User-Agent': `Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) discord/153481 Chrome/83.0.4103.122 Electron/9.3.5 Safari/537.36`,
        'x-debug-options': "bugReporterEnabled",
        'Accept-Encoding': "gzip, deflate",
        'Connection': "keep-alive"
    },
    
    // Discord uses this to fingerprint I believe, got from the client itself
    // Should probably be kept semi-updated (or try automating it)
    tokenXSuper: {
        "os": "Windows",
        "browser": "Discord Client",
        "release_channel": "stable",
        "client_version": "1.5.3481",
        "os_version": "10.0.19043",
        "os_arch": "x64",
        "system_locale": "en-US",
        "client_build_number": "153481",
        "client_event_source": null
    }
}