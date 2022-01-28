import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Home from './pages/Home';
import './App.css';

// /* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

// /* Basic CSS for apps built with Ionic */
// import '@ionic/react/css/normalize.css';
// import '@ionic/react/css/structure.css';
// import '@ionic/react/css/typography.css';

// /* Optional CSS utils that can be commented out */
// import '@ionic/react/css/padding.css';
// import '@ionic/react/css/float-elements.css';
// import '@ionic/react/css/text-alignment.css';
// import '@ionic/react/css/text-transformation.css';
// import '@ionic/react/css/flex-utils.css';
// import '@ionic/react/css/display.css';

import Questions from "./pages/Questions"


/* Theme variables */
import './theme/variables.css';
import Resultat from './pages/Resultat';
import { BuildVotes } from './pages/BuildVotes';

const App: React.FC = () => (
  <div>
    <IonReactRouter>
      <Route exact path="/">
        <Home />
      </Route>
      <Route exact path="/questions">
        <Questions />
      </Route>
      <Route exact path="/resultat">
        <Resultat />
      </Route>
      <Route exact path="/buildVote">
        <BuildVotes />
      </Route>
    </IonReactRouter>
  </div>
);

export default App;
