export default {
    input: 'lib/proxy.js',
    external: [
        '@podium/schemas',
        '@metrics/client',
        'path-to-regexp',
        '@podium/utils',
        'ttl-mem-cache',
        'http-proxy',
        'abslog',
        'url',
    ],
    output: [
        {
            exports: 'auto',
            format: 'cjs',
            dir: 'dist/',
            preserveModules: true,
        }
    ],
};
