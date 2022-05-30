import { IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import classNames from 'classnames/bind';
import classes from './OnBoarding.module.css';
import { useState } from 'react';
import { clearLine } from 'readline';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
let cx = classNames.bind(classes);


export function OnBoarding() {
    let history = useHistory();
    const [curPage, setCurPage] = useState(0);
    const nbPage = 3;

    const closeOnboarding = () => {
        localStorage.onboardingDone = true;
        history.push("/questions")
    }

    const overlaystyle = {
        position: "absolute", top: 0, left: 0, zIndex: 1000, width: "100vw", height: "100vh",
        background: "rgba(0,0,0, 0.3)", backdropFilter: " blur(3px)",
        display: 'flex', placeContent: 'center', alignItems: 'center'
    }

    const Passer = (props: { style: any }) => <div
        onClick={closeOnboarding}
        style={Object.assign({ cursor: "pointer", padding: "10px", color: "rgba(125,125,125, 0.5)"}, props.style)}
    >
        Passer
    </div>

    const DotDotDot = (props: { curPage: number, nbPage: number }) => <div className="loading-bar" style={{ display: 'flex', justifyContent: 'space-evenly', position: 'absolute', top: '50%', left: 0, width: "100%" }}>
        <ol style={{ padding: 10, margin: 0, display: 'flex', justifyContent: 'space-evenly', flex: "0 0 50px" }}>
            {[...Array(props.nbPage).keys()].map(x => <Dot key={x} selected={props.curPage === x} />)}
        </ol>
    </div>

    const Next = () => <button style={{
        position: 'absolute', bottom: 10, right: "10%", padding: "10px", fontSize: "16px", fontWeight: "bolder", lineHeight: "24px",
        background: "#00B794", borderRadius: 5, border: "none", cursor: "pointer", color: "#ffffff"
    }} onClick={() => curPage + 1 < nbPage ? setCurPage(curPage + 1) : closeOnboarding()}>
        {curPage + 1 < nbPage ? "Suivant" : "Je commence"}
    </button >

    const Back = () => curPage - 1 >= 0 ? <button style={{
        position: 'absolute', bottom: 10, left: "10%", padding: "10px", fontSize: "16px", fontWeight: "bolder", lineHeight: "24px",
        color: "#00B794", borderRadius: 5, border: "none", cursor: "pointer", background: 'none'
    }} onClick={() => curPage - 1 >= 0 ? setCurPage(curPage - 1) : closeOnboarding()}>
        <FontAwesomeIcon icon={faChevronLeft}/>
    </button > : null


    const pages = [
        <>
            <div className="top-half" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'start', flex: "1 1 50%" }}>
                <div className="logo" style={{ display: 'flex', justifyContent: 'center' }}>
                    <img style={{margin: 25}} width="100" src='https://datan.fr/assets/imgs/datan/logo_svg.svg' />
                </div>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: 1 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                        <h1 className={cx("surtitre")} style={{ marginBottom: "15px" }}>
                            LE QUIZ
                        </h1>
                        <h1 className={cx("titre")}>
                            <span style={{ color: "var(--datan-green)" }}>Mon député</span><br />et moi
                        </h1>
                    </div>
                </div>

            </div>
            <div className="bottom-half pattern_background" style={{ display: 'flex', justifyContent: 'center', flex: "1 1 50%" }}>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: 'center', textAlign: 'center', maxWidth: 300 }}>
                    <div style={{ display: "flex", justifyContent: 'center' }}>
                        <h2 className={cx("sousTitre")}>
                            Suis-je proche<br />
                            de mon député ?
                        </h2>
                    </div>
                    <div className="text" style={{ display: "flex", justifyContent: 'center' }}>
                        <p className={cx("text")}>
                            Découvre en 3 minutes <br />
                            si tu votes comme ton député
                        </p>
                    </div>
                </div>
            </div>
        </>,
        <>
            <div className="top-half" style={{ display: 'flex', flexDirection: "column", justifyContent: 'space-evenly', flex: "1 1 50%", position: 'relative', backgroundColor: "rgba(0, 183, 148, 0.15)"}}>
                <img  src="/assets/icon-step1.svg" style={{height: 220}}/>
            </div>
            <div className="bottom-half" style={{ display: 'flex', justifyContent: 'center', flex: "1 1 50%" }}>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: 'center', textAlign: 'center', maxWidth: 300 }}>
                    <div style={{ display: "flex", justifyContent: 'center' }}>
                        <h2 className={cx("sousTitre")}>
                            Je vote sur des propositions débattues à l'Assemblée
                        </h2>
                    </div>
                    <div className="text" style={{ display: "flex", justifyContent: 'center' }}>
                        <p className={cx("text")}>
                            A l'Assemblée nationale, les députés votent des loi précises. Comme eux, prend position et vote des lois discutées à l'Assemblée.
                        </p>
                    </div>
                </div>
            </div>
        </>,
        <>
            <div className="top-half" style={{ display: 'flex', flexDirection: "column", justifyContent: 'space-evenly', flex: "1 1 50%", position: 'relative', backgroundColor: "rgba(0, 183, 148, 0.15)"}}>
                <img  src="/assets/icon-step2.svg" style={{height: 220}}/>
            </div>
            <div className="bottom-half" style={{ display: 'flex', justifyContent: 'center', flex: "1 1 50%" }}>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: 'center', textAlign: 'center', maxWidth: 300 }}>
                    <div style={{ display: "flex", justifyContent: 'center' }}>
                        <h2 className={cx("sousTitre")}>
                            Mon député vote-t-il comme moi ?
                        </h2>
                    </div>
                    <div className="text" style={{ display: "flex", justifyContent: 'center' }}>
                        <p className={cx("text")}>
                            Découvre ta proximité politique avec ton député, ainsi qu’avec tous les groupes parlementaires de l’Assemblée.
                        </p>
                    </div>
                </div>
            </div>
        </>,
    ]

    return <IonPage style={overlaystyle}>
        <div style={{
            background: "var(--datan-white)", position: "relative",
            width: 'calc(100vw - 10px)', height: 'calc(min(100vw * 1.8, 100vh) - 10px)', maxWidth: 800, maxHeight: 600,
            display: 'flex', flexDirection: "column", justifyContent: 'space-evenly',
            marginBottom: '10vh',
            marginTop: '3vh'
        }}>
            {pages[curPage]}
            <DotDotDot curPage={curPage} nbPage={nbPage} />
            <Passer style={{ position: "absolute", top: 0, right: 0 }} />
            <Back />
            <Next />
        </div>
    </IonPage>
}

function Dot(props: { selected?: boolean }) {
    const basis: React.CSSProperties = {
        backgroundColor: "#C4C4C4",
        width: 7, height: 5,
        borderRadius: 5,
        listStyleType: "none",
        transition: "ease",
        transitionDuration: "background-color, width"
    }

    const selected: React.CSSProperties = {
        backgroundColor: "var(--datan-green)", width: 25
    }

    return <li style={Object.assign({}, basis, props.selected && selected)}></li>
}
