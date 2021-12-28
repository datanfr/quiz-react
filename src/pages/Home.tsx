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
          <div className={cx("body")}>
            <div className={cx("paragraphe-container", { "push-right": counter++ % 2 })}>
              <div className={cx("limit-width", "margin")}>
                <h1>Maecenas et urna metus</h1>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum eu nisi tellus. Etiam bibendum fermentum elementum. Aliquam dapibus tincidunt ligula, nec eleifend diam tempus ullamcorper. Nullam sit amet sagittis tellus. Vestibulum a dolor sapien. Mauris ultrices enim sem. Praesent condimentum accumsan magna, id mattis justo placerat a. Proin eget tempor sem. Fusce turpis tortor, pharetra at arcu at, porttitor tincidunt lectus.
              </div>
            </div>
            <div className={cx("paragraphe-container", { "push-right": counter++ % 2 })}>
              <div className={cx("limit-width", "margin")}>
                <h1>Proin cursus est vitae</h1>
                Pellentesque dui libero, ullamcorper eu vestibulum et, bibendum eu metus. Nulla ut turpis et tortor blandit finibus eu auctor nisl. Morbi aliquet mattis ex. Cras et augue ultricies, placerat nunc ultrices, mattis nibh. Morbi et dolor non purus finibus ultricies. Nulla facilisi. Morbi sollicitudin lorem vel feugiat pulvinar. Nulla nulla odio, hendrerit eu lacinia ultricies, varius id neque. Fusce vehicula risus eget ligula auctor, eu ultricies lectus faucibus. Etiam nunc risus, molestie in varius nec, bibendum nec quam. Vestibulum quis rutrum quam.
              </div>
            </div>
            <div className={cx("paragraphe-container", { "push-right": counter++ % 2 })}>
              <div className={cx("limit-width", "margin")}>
                <h1>Nullam ultricies massa</h1>
                Duis augue velit, laoreet eu placerat sed, iaculis ac nisi. Cras sollicitudin pulvinar elit, quis dapibus mi. Vestibulum interdum tortor nec est suscipit rhoncus. Nam eu tristique turpis, et faucibus metus. Nulla congue felis non neque sagittis, sit amet suscipit justo tristique. Maecenas consectetur erat non quam faucibus vulputate. Cras et aliquam diam. Etiam sit amet nisl augue. Donec posuere dui a maximus pharetra. Vestibulum placerat, enim id aliquet hendrerit, massa tortor ultrices enim, facilisis luctus sem eros at massa. Duis pellentesque consequat sem eu dictum.
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