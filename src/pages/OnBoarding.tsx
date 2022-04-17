import { IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';

export function OnBoarding() {
    let history = useHistory();
    
    const overlaystyle = {position: "absolute", zIndex: 1000, background: "rgba(0,0,0, 0.5)", width: "100vw", height: "100vh", top: 0, left: 0, display:'flex', placeContent: 'center', alignItems: 'center'}
    return <IonPage style={overlaystyle}>
        <div className="top-half">
            <div onClick={() => {
                localStorage.onboardingDone = true;
                history.push("/")
            }}>Passer</div>
            <div className="logo"></div>
            <div className="titre"></div>
        </div>
        <div className="bottom-half">
            <div className="loading-bar"></div>
            <h1 className="titre"></h1>
            <p className="text"></p>
        </div>
    </IonPage>
}