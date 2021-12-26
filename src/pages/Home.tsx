import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import classNames from 'classnames/bind';
import classes from './Home.module.css';
import Header from "../components/Header"
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { PureComponent } from 'react';

let cx = classNames.bind(classes);

interface Props extends RouteComponentProps { }
interface State {}

class Home extends PureComponent<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      count: 0
    }
  }

  render() {
    // const { name, ...remains } = this.props
    return <IonPage>
      <div style={{ overflow: "auto", justifyContent: "flex-start" }}>
        <div className={cx("center-body")}>
          <div className={cx("body")}>
            
          </div>
        </div>
      </div>
      <Header title="Accueil" onBackClick={() => this.props.history.goBack()} />
    </IonPage>
  }
}

export default withRouter(Home);