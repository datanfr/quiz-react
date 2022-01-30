import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import classNames from 'classnames/bind';
import classes from './Home.module.css';
import Header from "../components/Header"
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { PureComponent } from 'react';

let cx = classNames.bind(classes);

interface Props extends RouteComponentProps { }
interface State { }

class Home extends PureComponent<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      count: 0
    }
  }

  render() {
    // const { name, ...remains } = this.props
    var counter = 0
    return <IonPage>
      <div style={{ overflow: "auto", marginTop: "var(--header-height)" }}>
        <div className={cx("center-body")}>
          <div className={cx("body")} style={{marginBottom: "var(--buttons-height)"}}>
            <div className={cx("paragraphe-container", { "push-right": counter++ % 2 })}>
              <div className={cx("limit-width", "margin")}>
                <h1>Êtes-vous proche de votre député ?</h1>
              </div>
            </div>
            <div className={cx("paragraphe-container", { "push-right": counter++ % 2 })}>
              <div className={cx("limit-width", "margin")}>
                <h1>De votre parti politique ?</h1>
              </div>
            </div>
            <div className={cx("paragraphe-container", { "push-right": counter++ % 2 })}>
              <div className={cx("limit-width", "margin")}>
                <h1>Faites le quizz pour le savoir ! </h1>
              </div>
            </div>
            <div className={cx("paragraphe-container", { "push-right": counter++ % 2 })}>
              <div className={cx("limit-width", "margin")}>
                Ce quizz va vous permet de déterminer si vous avez les mêmes idées que le député de votre circonscription.
              </div>
            </div>
            <div className={cx("paragraphe-container", { "push-right": counter++ % 2 })}>
              <div className={cx("limit-width", "margin")}>
              Une des activités principales des députés à l'Assemblée nationale est de voter sur des textes de loi et des amendements. Ils donnent une indication des positions de chaque élu : est-il pour ou contre la réintroduction des pesticides ?
              </div>
            </div>
            <div className={cx("paragraphe-container", { "push-right": counter++ % 2 })}>
              <div className={cx("limit-width", "margin")}>
              Votez vous-même sur des lois discutées dans l'hémicycle de l'Assemblée pour déterminer votre proximité avec votre parlementaire et les différents groupes politiques.
              </div>
            </div>
          </div>
        </div>
      </div>
      <Header title="Accueil"  />
      <div className={cx("buttons", "center-body")} >
        <div className={cx("body", "flex")} style={{ justifyContent: "space-evenly", alignContent: "center" }}>
          <Link to="/questions" className={cx("datan-green-bg", "flex", "align-justify-center", "shadow")} style={{height: "60px"}}>
            Commencer le test
          </Link>
        </div>
      </div>
    </IonPage>
  }
}

export default withRouter(Home);