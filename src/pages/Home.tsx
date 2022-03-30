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
          <div className={cx("title-container")}>
              <div className={cx("title")}>
                <img src="https://datan.fr/assets/imgs/datan/logo_svg.svg" width="90%" alt="Logo Datan"/>
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
    </IonPage >
  }
}

export default withRouter(Home);