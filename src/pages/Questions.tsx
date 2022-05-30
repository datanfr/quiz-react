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
import { fetchQuestions } from "../models/Question"

export type QuestionModel = typeof questions[number]

let cx = classNames.bind(classes);


function Question(props: { question: QuestionModel, cqi: number, questionsDataLength: number }) {
  const { question, cqi, questionsDataLength } = props
  return <div>
    <div style={{
      "backgroundImage": `linear-gradient(130deg, rgba(0, 183, 148, 1) 10%, rgba(36, 107, 150, 0.85) 112%), url("https://datan.fr/assets/imgs/cover/hemicycle-from-back.jpg")`,
      "backgroundPosition": "center",
      "backgroundSize": "cover"
    }}>
      <div className={cx("center-body")}>
        <div className={cx("body")} style={{ marginTop: "var(--header-height)" }}>
          <div className={cx("title-container")}>
            <div className={cx("content-container")}>
              <div style={{ display: "flex", justifyContent: "center", alignItems: 'flex-end', fontSize: "0.7em", flex: "0 10 17%" }}>
                <div style={{ margin: 10 }}>
                  {"Question" + '\u00A0' + `${cqi + 1}/${questionsDataLength}`}
                </div>
              </div>
              <div className={cx("title")} style={{ display: "flex", justifyContent: "center", alignItems: 'center', flex: "1 0 35%" }}>
                <div style={{ margin: "10px 10px" }}>
                  {question.voteTitre}
                </div>
              </div>
              <div className={cx("explication")} style={{ display: "flex", justifyContent: "center", alignItems: 'center', flex: "1 0 25%" }}>
                <div style={{ margin: "10px 10px" }}>
                  {question.explication || <div style={{ borderTop: "2px solid var(--datan-white)", width: "100px", opacity: 0.5 }}></div>}
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "center", alignItems: 'center', fontSize: "0.5em", flex: "0 5 22%" }}>
                <div
                  onClick={() => document.querySelector("#for")?.scrollIntoView({ behavior: "smooth" })}
                  style={{ cursor: "pointer", border: "2px white solid", borderRadius: "7px" }}
                >
                  <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: 'center', margin: "3px 15px" }}>
                    <div>Les arguments</div>
                    <div><FontAwesomeIcon icon={faChevronDown} /></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div id="for" className="flex" style={{ justifyContent: "center", scrollMarginTop: "var(--header-height)", marginBottom: "calc(var(--buttons-height) + 15px)", marginTop: "calc(var(--buttons-height)/2 - 25px  + 15px - 1em)" }}>
      <div>
        <p style={{ fontSize: "17px", fontWeight: 800, color: "var(--datan-green)", marginLeft: "1em" }}>LES ARGUMENTS POUR</p>
        {question.arguments.filter((argument: any) => argument.opinion === "POUR").map((argument: any) => <div style={{ borderLeft: "2px solid var(--datan-green)", padding: "10px", margin: "10px", maxWidth: "600px" }}>{argument.texte}</div>)}
      </div>
      <div style={{}}>
        <p style={{ fontSize: "17px", fontWeight: 800, color: "var(--datan-red)", marginLeft: "1em" }}>LES ARGUMENTS CONTRE</p>
        {question.arguments.filter((argument: any) => argument.opinion === "CONTRE").map((argument: any) => <div style={{ borderLeft: "2px solid var(--datan-red)", padding: "10px", margin: "10px", maxWidth: "600px" }}>{argument.texte}</div>)}
      </div>
    </div>
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

interface Props extends RouteComponentProps<{ no: string }> {

}
interface State {
  cqi: number,
  questionsData: null | QuestionModel[]
}
class Questions extends PureComponent<Props, State> {



  constructor(props: Props) {
    super(props);
    const { match, location, history } = this.props;
    this.state = {
      questionsData: null,
      cqi: match.params.no ? parseInt(match.params.no) - 1 : 0
    }
  }

  componentDidMount() {
    fetchQuestions
      .then(json => this.setState({ questionsData: json }))
      .catch(err => console.log(err));
  }


  back() {
    if (this.state.cqi - 1 >= 0) {
      this.setState({ cqi: this.state.cqi - 1 })
      this.props.history.goBack()
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
      } else {
        this.props.history.push(`/questions/${this.state.cqi + 1 + 1}`)
        this.setState({ cqi: this.state.cqi + 1 })
      }
    }
  }

  render() {
    return <IonPage key={this.state.cqi}>
      <div style={{ overflow: "auto", justifyContent: "flex-start" }}>
        {
          this.state.questionsData
            ? <Question question={this.state.questionsData[this.state.cqi]} cqi={this.state.cqi} questionsDataLength={this.state.questionsData.length} />
            : <div style={{
              "backgroundImage": `linear-gradient(130deg, rgba(0, 183, 148, 1) 10%, rgba(36, 107, 150, 0.85) 112%), url("https://datan.fr/assets/imgs/cover/hemicycle-from-back.jpg")`,
              "backgroundPosition": "center",
              "backgroundSize": "cover"
            }}>
              <div className={cx("center-body")}>
                <div className={cx("body")} style={{ marginTop: "var(--header-height)" }}>
                  <div className="flex align-justify-center tex" style={{
                    "height": "calc(100vh - var(--header-height))",
                    "color": "var(--datan-white)"
                  }}>
                    Les questions sont en cours de chargement...
                  </div>
                </div>
              </div>
            </div>
        }

      </div>
      <Header onBackClick={this.state.cqi - 1 >= 0 ? () => this.back() : undefined} />
      <Buttons
        onPour={async () => await this.saveAndGoToNextQuestion("pour")}
        onContre={async () => await this.saveAndGoToNextQuestion("contre")}
        onNspp={async () => await this.saveAndGoToNextQuestion("abstention")}
      />
    </IonPage>
  }
}


export default withRouter(Questions)
