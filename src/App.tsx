import { Popup } from "./shared";
import { Helmet } from "react-helmet";

const App = () => (
  <>
    <Helmet>
      <title>My Chrome Extension - Free Daily AI Tool</title>
      <meta
        name="description"
        content="Get 3 free daily requests with our Chrome AI extension..."
      />
    </Helmet>
    <Popup />
  </>
);

export default App;