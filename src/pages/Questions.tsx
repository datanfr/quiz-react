import { IonPage } from '@ionic/react';
import classNames from 'classnames/bind';
import React, { PureComponent } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import Api from '../Api';
import CardStack from '../components/CardStack';
import Header from "../components/Header";
import { getResponses, Reponse, setResponses } from '../models/Reponse';
import classes from './Questions.module.css';
import questions from "../data/questions.json";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown } from '@fortawesome/free-solid-svg-icons'
import {fetchQuestions} from "../models/Question"

export type QuestionModel = typeof questions[0]

let cx = classNames.bind(classes);


function Question(props: { question: QuestionModel }) {
  const { question } = props
  return <div>
    <div style={{
        "backgroundImage": `linear-gradient(130deg, rgba(0, 183, 148, 0.85) 0.65%, rgba(36, 107, 150, 0.85) 112%), url("https://datan.fr/assets/imgs/cover/hemicycle-from-back.jpg")`,
        "backgroundPosition": "center",
        "backgroundSize": "cover"
      }}>
      <div className={cx("center-body")}>
        <div className={cx("body")} style={{ marginTop: "var(--header-height)" }}>
          <div className={cx("title-container")}>
            <div className={cx("title")}>
              {question.voteTitre}
              <div style={{position: "relative", top: "10vh", fontSize: "0.5em", display: "flex", justifyContent: "center"}}>
                <div onClick={() => document.querySelector("#for")?.scrollIntoView({behavior: "smooth"})} style={{cursor: "pointer"}}>
                  <div>En savoir plus</div>
                  <div><FontAwesomeIcon icon={faChevronDown}/></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div style={{ height: "200px" }}>
    </div>
    <fieldset id="for" style={{ color: "green", border: "1px solid green" }}>
      <legend style={{ padding: "0px 10px" }}>Les pour</legend>
      <ul style={{ color: "black" }}>
        {question.arguments.filter((argument: any) => argument.opinion === "POUR").map((argument: any) => <li>{argument.texte}</li>)}
      </ul>
    </fieldset>
    <fieldset style={{ color: "red", border: "1px solid red", marginBottom: "var(--buttons-height)" }}>
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
        onClick={p.onContre}
      >
        CONTRE
      </div>
      <div
        className={cx("flex", "align-justify-center", "shadow", "button", "osef")}
        onClick={p.onNspp}
      >
        SANS&nbsp;AVIS
      </div>
      <div
        className={cx("flex", "align-justify-center", "shadow", "button", "pour")}
        onClick={p.onPour}
      >
        POUR
      </div>
    </div>
  </div>
}

interface Props extends RouteComponentProps { }
interface State {
  cqi: number //Current question index,
  questionsData: null | QuestionModel[]
}
class Questions extends PureComponent<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      cqi: 0,
      questionsData: null,
    }
  }

  componentDidMount() {
    fetchQuestions()
      .then(json => this.setState({ questionsData: json }))
      .catch(err => console.log(err));
  }


  back() {
    if (this.state.cqi - 1 >= 0) {
      this.setState({ cqi: this.state.cqi - 1 })
    } else {
      this.props.history.goBack()
    }
  }

  async saveAndGoToNextQuestion(respStr: Reponse) {
    if (this.state.questionsData) {
      const r = await getResponses()
      const cq = this.state.questionsData[this.state.cqi]
      r[cq.vote_id] = respStr
      await setResponses(r)
      if (this.state.cqi + 1 >= this.state.questionsData.length) {
        this.props.history.push("/resultat")
      }
      this.setState({ cqi: this.state.cqi + 1 })
    }
  }

  render() {
    if (this.state.questionsData) {
      return <IonPage key={this.state.cqi}>
        <div style={{ overflow: "auto", justifyContent: "flex-start" }}>
          <Question question={this.state.questionsData[this.state.cqi]} />
        </div>
        <Header title={"Question" + '\u00A0' + `${this.state.cqi + 1}/${this.state.questionsData.length}`} onBackClick={() => this.back()} />
        <Buttons
          onPour={async () => await this.saveAndGoToNextQuestion("pour")}
          onContre={async () => await this.saveAndGoToNextQuestion("contre")}
          onNspp={async () => await this.saveAndGoToNextQuestion("abstention")}
        />
      </IonPage>
    } else {
      return "Loading questions"
    }
  }
}


export default withRouter(Questions)