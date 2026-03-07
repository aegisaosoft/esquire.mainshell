/*
 * Esquire frameworks (tm)
 * Webpack config — mainshell (Module Federation HOST)
 * Copyright(c) 2001, 2026 Aegis AO Soft LLC
 */

const path                  = require('path');
const HtmlWebpackPlugin     = require('html-webpack-plugin');
const CopyPlugin            = require('copy-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = (env, argv) => {
  const isProd = argv.mode === 'production';

  return {
    entry: './src/index.ts',

    output: {
      path:          path.resolve(__dirname, 'dist'),
      publicPath:    'auto',
      clean:         true,
    },

    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
      modules: [path.resolve(__dirname, 'node_modules'), 'node_modules'],
      alias: {
        // Point to local esq-auth-context package (no npm publish needed)
        'esq-auth-context': path.resolve(__dirname, '../packages/esq-auth-context/src/index.ts'),
      }
    },

    module: {
      rules: [
        {
          test:    /\.tsx?$/,
          use:     'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use:  ['style-loader', 'css-loader'],
        },
      ]
    },

    plugins: [
      // ─── Module Federation — HOST configuration ──────────────────────────
      new ModuleFederationPlugin({
        name:    'mainshell',
        remotes: {},  // empty — plugins loaded dynamically at runtime

        shared: {
          react: {
            singleton:       true,
            requiredVersion: '^18.0.0',
            eager:           true,   // host loads React eagerly
          },
          'react-dom': {
            singleton:       true,
            requiredVersion: '^18.0.0',
            eager:           true,
          },
          'keycloak-js': {
            singleton:       true,
            requiredVersion: '^26.0.0',
            eager:           true,   // only mainshell initialises Keycloak
          },
          // ─── THE KEY: shared auth context as singleton ───────────────────
          // All plugins receive the same EsqAuthCtx.Provider instance
          'esq-auth-context': {
            singleton:       true,
            eager:           true,
            // version matching disabled — it's a local package
          },
        },
      }),

      new HtmlWebpackPlugin({
        template: './public/index.html',
        filename: 'index.html',
      }),

      // Copy static assets (config.json, silent-check-sso.html, etc.)
      new CopyPlugin({
        patterns: [
          { from: 'public/assets',               to: 'assets' },
          { from: 'public/silent-check-sso.html',to: 'silent-check-sso.html' },
        ]
      }),
    ],

    devServer: {
      port:        3000,
      historyApiFallback: true,
      headers:     { 'Access-Control-Allow-Origin': '*' },
      proxy: [
        // Forward /api to Java gateway during dev
        {
          context: ['/api'],
          target:  'http://localhost:7070',
          changeOrigin: true,
        },
      ],
    },
  };
};
