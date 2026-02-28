import { Helmet } from "react-helmet-async";
import PopupPage from "./components/pop-up";

const App = () => (
  <>
    <Helmet>
      <title>TextPro – AI Formatter</title>
      <meta name="description" content="Format and transform selected text with AI" />
    </Helmet>
    <PopupPage />
  </>
);

export default App;