import ContentPopup from "./content";
import { Helmet } from "react-helmet";

const App = () => {
  return (
    <>
     <Helmet>
      <title>My Chrome Extension - Free Daily AI Tool</title>
      <meta name="description" content="Get 3 free daily requests with our Chrome AI extension..." />
    </Helmet>
      <ContentPopup/>
    </>
  )
}

export default App;
