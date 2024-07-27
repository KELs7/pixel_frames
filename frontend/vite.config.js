import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import svg from '@poppanator/sveltekit-svg';

import inject from "@rollup/plugin-inject";
import commonjs from "@rollup/plugin-commonjs";
import nodePolyfills from "rollup-plugin-polyfill-node";

import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
import { NodeModulesPolyfillPlugin } from "@esbuild-plugins/node-modules-polyfill";

const mode = process.env.NODE_ENV;
const dev = mode === 'development';

export default defineConfig ({
    plugins: [
        sveltekit(),
        svg(),
        commonjs({
            include: /node_modules/, // Only transpile CommonJS modules from node_modules
        }),
        dev && nodePolyfills({
            include: [
                "node_modules/**/*.js",
                new RegExp("node_modules/.vite/.*js"),
                "http",
                "crypto",
                "buffer",
            ],
        }),
    ],
    build: {
        rollupOptions: {
            plugins: [
                nodePolyfills({ include: ["crypto", "http"] }),
                inject({ Buffer: ["Buffer", "Buffer"] }),
            ],
        },
        commonjsOptions: {
            transformMixedEsModules: true,
        },
    },
    ssr: {
        noExternal: ['dayjs'],
    },
    optimizeDeps: {
        esbuildOptions: {
            // Node.js global to browser globalThis
            define: {
                global: "globalThis",
            },
            // Enable esbuild polyfill plugins
            plugins: [
                NodeGlobalsPolyfillPlugin({
                    process: true,
                    buffer: true,
                }),
                NodeModulesPolyfillPlugin(),
            ],
        },
    },
    define: {
        global: "window",
    }
});