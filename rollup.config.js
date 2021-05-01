export default {
    input: 'lib/context.js',
    external: [
        '@podium/schemas',
        '@metrics/client',
        'bcp47-validate',
        '@podium/utils',
        'decamelize',
        'lru-cache',
        'bowser',
        'abslog',
        'assert',
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
