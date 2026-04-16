const path = require('path');

module.exports = {
  title: 'Ecommerce UI Pattern Library',
  version: '1.0.0',
  components: [
    'src/components/**/*.{js,jsx,ts,tsx}',
    'src/pages/admin/component/**/*.{js,jsx,ts,tsx}',
    'src/chat/components/**/*.{js,jsx,ts,tsx}'
  ],
  ignore: [
    '**/__tests__/**',
    '**/*.test.{js,jsx,ts,tsx}',
    '**/*.spec.{js,jsx,ts,tsx}',
    '**/*.d.ts',
    '**/index.jsx', // Often just exports
    'src/components/Gmap.jsx' // Might cause issues without API key
  ],
  styleguideComponents: {
    Wrapper: path.join(__dirname, 'src/styleguide/ThemeWrapper.jsx'),
  },
  skipComponentsWithoutExample: true,
  exampleMode: 'expand',
  usageMode: 'expand',
  webpackConfig: {
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      fallback: {
        "fs": false,
        "path": false,
        "os": false
      }
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', { targets: "defaults" }],
                ['@babel/preset-react', { runtime: "automatic" }]
              ],
            },
          },
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|eot|ttf|otf)$/,
          type: 'asset/resource',
        },
      ],
    },
  },
  template: {
    head: {
      links: [
        {
          rel: 'stylesheet',
          href: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css'
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Segoe+UI:wght@400;700&display=swap'
        }
      ]
    }
  }
};
