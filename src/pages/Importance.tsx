import classNames from 'classnames/bind';
import React, { PureComponent } from 'react';
import Header from '../components/Header';
import classes from './ChooseCategory.module.css';
import Slider from '@material-ui/core/Slider';
import { withStyles } from '@material-ui/core';
import { IonPage } from '@ionic/react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Plugins } from '@capacitor/core';

const { Storage } = Plugins;


const CustomSlider = withStyles({
  root: {
    color: "var(--datan-green)",
  },
  thumb: {
    height: 24,
    width: 24,
    backgroundColor: '#fff',
    border: '2px solid currentColor',
    marginTop: -8,
    marginLeft: -12,
    '&:focus, &:hover': {
      boxShadow: '0px 0px 0px 8px rgba(84, 199, 97, 0.16)'
    },
    '&$active': {
      boxShadow: '0px 0px 0px 12px rgba(84, 199, 97, 0.16)'
    }
  },
  track: {
    height: 8,
    borderRadius: 4
  },
  rail: {
    height: 8,
    borderRadius: 4
  }
})(Slider)

let cx = classNames.bind(classes);

interface Props extends RouteComponentProps { }
interface State { hint: string }

const valToText: { to: number, hint: string }[] = [
  {/*0*/to: 33, hint: "Peu importante" },
  {/*33*/to: 66, hint: "Assez importante" },
  {/*66*/to: 100, hint: "Très importante" }
]

const defaultSliderValue = 50

class Importance extends PureComponent<Props, State> {

  params: URLSearchParams;
  val: number;
  weight: Array<any>;

  constructor(props: Props) {
    super(props);
    this.state = {
      hint: valToText.find(x => x.to < defaultSliderValue)?.hint || "Oops something is wrong"
    }
    this.val = defaultSliderValue
    this.params = new URLSearchParams(this.props.location.search)
    this.weight = [];
    Storage.get({ key: 'weight' }).then((weight) => {
      this.weight = typeof weight.value == "string" ? JSON.parse(weight.value) : [];
    })
  }

  componentDidMount() {
  }

  handleSliderChange(e: any, val: number) {
    this.setState({
      hint: valToText.find(x => val <= x.to)?.hint || "Oops something is wrong"
    })
    this.val = val;
  }

  saveWeight() {
    const found = this.weight.find(el => el.theme == this.params.get("theme"));
    console.log(found)
    if (!found) {
      this.weight.push({ theme: this.params.get("theme"), weight: this.val })
    }
    else {
      for (let i = 0; i < this.weight.length; i++) {
        if (this.weight[i].theme == this.params.get("theme")) {
          this.weight[i].weight = this.val;
        }
      }
    }
    Storage.set({ key: "weight", value: JSON.stringify(this.weight) })
    this.props.history.push(`/questions?theme=${this.params.get("theme")}&importance=${this.val}`)
  }

  render() {

    return <IonPage><div className={cx("fullscreen", "flex", "column")}>
      <Header onBackClick={() => this.props.history.push(`/categories`)} />
      <div className={cx("flex", "flex-static", "datan-blue-bg")}><div className={cx('flex', 'margin')}>{this.params.get("theme")}</div></div>
      <div className={cx("flex", "column", "margin")}>
        <div className={cx("flex", "flex-static")}>
          <h4>A quel point cette catégorie est importante pour vous ?</h4>
        </div>
        <div className={cx("flex", "flex-static")}>
          Merci de renseigner l'importance de cette catégorie. Cela nous aidera a améliorer la précision des résultats.
        </div>
      </div>
      <div className={cx("flex", "align-justify-center", "column")}>
        <div className={cx("flex", "align-justify-center")} style={{ width: "250px" }}>
          <CustomSlider onChange={(e, val) => this.handleSliderChange(e, val as number)} />
        </div>
        <div className={cx("flex", "align-justify-center")}>
          {this.state.hint}
        </div>
      </div>
      <div className={cx("flex", "align-justify-center")} onClick={this.saveWeight.bind(this)}>
        <div className={cx("margin")}>
          <div className={cx("flex", "datan-blue-bg", "round-corner")}>
            <div className={cx("margin")}>Commencer</div>
          </div>
        </div>
      </div>
    </div></IonPage>
  }
}

export default withRouter(Importance)