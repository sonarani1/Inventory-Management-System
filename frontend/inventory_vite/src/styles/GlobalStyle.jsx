import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  :root { --max-width: 1100px; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
    background: #f6f8fa;
    color: #222;
  }
  a { text-decoration: none; color: inherit; }
`;

export default GlobalStyle;
