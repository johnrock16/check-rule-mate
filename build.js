import esbuild from 'esbuild';

esbuild.build({
    entryPoints: ['./src/main.js'],
    bundle: true,
    platform: 'neutral',
    format: 'esm',
    outdir: 'dist',
    target: ['esnext'],
    minify: true
}).then(() => {
    esbuild.build({
        entryPoints: ['./src/main.js'],
        bundle: true,
        outfile: './dist/main.cjs.js',
        platform: 'node',
        target: 'node16',
        format: 'cjs',
        minify: true
    });
}).then(() => {
    console.log('Build completed successfully.');
}).catch(() => process.exit(1));
