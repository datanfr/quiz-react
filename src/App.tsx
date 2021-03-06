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
import { OnBoarding } from './pages/OnBoarding';
import { DeputeStats, DeputeStatsPage } from './pages/DeputeStats';
import { GroupeStatsPage } from './pages/GroupeStats';
import { BasicPage } from './pages/BasicPage';
import { AlgorithmPage } from './pages/AlgorithmPage';
import { useTrackPage } from './useTrackPage';

const TrackPage : React.FC = () => {
  useTrackPage();
  return <></>
}

const App: React.FC = () => {

  return <div>
    <IonReactRouter>
      <TrackPage />
      <Route exact path="/">
        <OnBoarding/>
        <Questions />
      </Route>
      <Route exact path="/questions">
        <Questions />
      </Route>
      <Route exact path="/a-basic-page">
        <BasicPage name="Awening" />
      </Route>
      <Route exact path="/methodologie">
        <AlgorithmPage />
      </Route>
      <Route exact path="/questions/:no">
        <Questions />
      </Route>
      <Route exact path="/resultat">
        <Resultat />
      </Route>
      <Route exact path="/buildVote">
        <BuildVotes />
      </Route>
      <Route exact path="/depute-stats/:mpId">
        <DeputeStatsPage />
      </Route>
      <Route exact path="/groupe-stats/:id">
        <GroupeStatsPage />
      </Route>
    </IonReactRouter>

  </div>
}

export default App;
