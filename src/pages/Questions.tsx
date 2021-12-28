import { IonPage } from '@ionic/react';
import classNames from 'classnames/bind';
import React, { PureComponent } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import Api from '../Api';
import CardStack from '../components/CardStack';
import Header from "../components/Header";
import questionsData from "../mock/get_most_famous_votes.json";
import classes from './Questions.module.css';
import { Plugins } from '@capacitor/core';
const { Storage } = Plugins;

let cx = classNames.bind(classes);

type QuestionModel = typeof questionsData[0]

function Question(props: { question: QuestionModel }) {
  const { question } = props
  return <div>
    <div className={cx("title-container")}>
      <div className={cx("title")}>
        {question.voteTitre}
      </div>
    </div>
    <fieldset style={{ color: "green", border: "1px solid green" }}>
      <legend style={{ padding: "0px 10px" }}>Les pour</legend>
      <ul style={{ color: "black" }}>
        {question.arguments.filter((argument: any) => argument.opinion === "POUR").map((argument: any) => <li>{argument.texte}</li>)}
      </ul>
    </fieldset>
    <fieldset style={{ color: "red", border: "1px solid red", marginBottom: "200px" }}>
      <legend style={{ padding: "0px 10px" }}>Les contre</legend>
      <ul style={{ color: "black" }}>
        {question.arguments.filter((argument: any) => argument.opinion === "CONTRE").map((argument: any) => <li>{argument.texte}</li>)}
      </ul>
    </fieldset>
  </div>
}

interface ButtonsProps {
  onContre: () => void
  onNspp: () => void
  onPour: () => void
}
function Buttons(p: ButtonsProps) {
  return <div className={cx("buttons", "center-body")}>
    <div className={cx("body", "flex")} style={{ justifyContent: "space-evenly", alignContent: "center" }}>
      <div
        className={cx("flex", "align-justify-center", "shadow", "button", "contre")}
        data-value="{'importance': 1, 'pour': -1}"
        onClick={p.onContre}
      >
        CONTRE
      </div>
      <div
        className={cx("flex", "align-justify-center", "shadow", "button", "osef")}
        data-value="{'importance': 0, 'pour': 0}"
        onClick={p.onNspp}
      >
        SANS&nbsp;AVIS
      </div>
      <div
        className={cx("flex", "align-justify-center", "shadow", "button", "pour")}
        data-value="{'importance': 1, 'pour': 1}"
        onClick={p.onPour}
      >
        POUR
      </div>
    </div>
  </div>
}

interface Props extends RouteComponentProps { }
interface State {
  cqi: number //Current question index
}
class Questions extends PureComponent<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      cqi: 0
    }
  }

  back() {
    if (this.state.cqi - 1 >= 0) {
      this.setState({cqi: this.state.cqi+1})
    } else {
      this.props.history.goBack()
    }
  }

  async saveAndGoToNextQuestion(respStr : string)  {
    const r = await Storage.get({key: "responses"}).then(x => x.value ? JSON.parse(x.value) : {});
    const cq = questionsData[this.state.cqi]
    r[cq.vote_id] = respStr
    await Storage.set({key:"responses", value: JSON.stringify(r)})
    if (this.state.cqi + 1 >= questionsData.length) {
      this.props.history.push("/resultats")
    }
    this.setState({cqi: this.state.cqi + 1})
  }

  render() {
    console.log(this.state)
    return <IonPage>
      <div style={{ overflow: "auto", justifyContent: "flex-start" }}>
        <div className={cx("center-body")}>
          <div className={cx("body")}>
            <Question question={questionsData[this.state.cqi]} />
          </div>
        </div>
      </div>
      <Header title={"Question" + '\u00A0' + `1/${questionsData.length}`} onBackClick={() => this.back()} />
      <Buttons
        onPour={async () => await this.saveAndGoToNextQuestion("pour")}
        onContre={async () => await this.saveAndGoToNextQuestion("contre")}
        onNspp={async () => await this.saveAndGoToNextQuestion("nspp")}
      />
    </IonPage>
  }
}


export default withRouter(Questions)