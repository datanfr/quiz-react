import React, { Fragment, PureComponent } from 'react';
import classNames from 'classnames/bind';
import classes from './Questions.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome } from '@fortawesome/free-solid-svg-icons'
import CardStack from '../components/CardStack';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import { faSmile, faFrown, faMeh } from '@fortawesome/free-regular-svg-icons'
import Api from '../Api';
import mockedData from "../mock/get_most_famous_votes.json"
import Header from "../components/Header"
import { IonPage } from '@ionic/react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Plugins } from '@capacitor/core';
import { TransitionGroup } from 'react-transition-group';

const { Storage } = Plugins;

let cx = classNames.bind(classes);

type QuestionsModel = any
interface Props extends RouteComponentProps { }
interface State { questions: QuestionsModel[] }


function Question(props: { question: QuestionsModel }) {
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
    <fieldset style={{ color: "red", border: "1px solid red", marginBottom: "10px" }}>
      <legend style={{ padding: "0px 10px" }}>Les contre</legend>
      <ul style={{ color: "black" }}>
        {question.arguments.filter((argument: any) => argument.opinion === "CONTRE").map((argument: any) => <li>{argument.texte}</li>)}
      </ul>
    </fieldset>
  </div>
}

function Buttons(props: any) {
  return <div className={cx("buttons", "center-body")}>
    <div className={cx("body", "flex")} style={{ justifyContent: "space-evenly", alignContent: "center" }}>
      <div
        className={cx("flex", "align-justify-center", "shadow", "button", "contre")}
        data-value="{'importance': 1, 'pour': -1}"
      //onClick={e => this.cardStackRef.current?.swipeTopCard("left")}
      >
        CONTRE
      </div>
      <div
        className={cx("flex", "align-justify-center", "shadow", "button", "osef")}
        data-value="{'importance': 0, 'pour': 0}"
      //onClick={e => this.cardStackRef.current?.swipeTopCard("up")}
      >
        SANS AVIS
      </div>
      <div
        className={cx("flex", "align-justify-center", "shadow", "button", "pour")}
        data-value="{'importance': 1, 'pour': 1}"
      //onClick={e => this.cardStackRef.current?.swipeTopCard("right")}
      >
        POUR
      </div>
    </div>
  </div>
}

class Questions extends PureComponent<Props, State> {

  apiCall: Promise<any[]>
  cardStackRef: React.RefObject<CardStack<any>>
  params: URLSearchParams;

  constructor(props: Props) {
    super(props);
    this.cardStackRef = React.createRef();
    this.apiCall = Api.getCards('sante', 10)
    this.state = {
      questions: []
    }
    this.params = new URLSearchParams(window.location.search)
  }

  componentDidMount() {
    if (this.params.has("mock")) {
      const questions = mockedData
      this.setState({ questions })
    } else {
      this.apiCall.then(
        resp => this.handleApiResponse(resp),
        e => this.handleApiError(e)
      )
    }

  }

  handleApiError(e: Error) {
    const questions = mockedData
    console.log("Error caught putting fake questions data", e, questions)
    this.setState({ questions })
  }

  handleApiResponse(questions: any[]) {
    console.log("Loading questions", questions)
    this.setState({ questions })
  }

  back() {
    const card = this.cardStackRef.current?.resetLastCard()
    if (!card) this.props.history.push(`/importance?theme=${this.params.get("theme")}`)
  }

  async saveVotes(votesSent: any) {
    const weightStored = await Storage.get({ key: 'weight' });
    let weights: Array<any> = [];
    if (typeof weightStored.value == 'string') {
      weights = JSON.parse(weightStored.value);
    }
    Storage.get({ key: 'votes' }).then(async votes => {
      let storedVotes = typeof votes == "string" ? JSON.parse(votes) : [];
      let weight: Number = weights.find((el: any) => el.theme == votesSent[0].cardData.category_libelle) || 3;
      for (let card of votesSent) {
        let choice = 0;
        if (card.swiped == "right") {
          choice = 1;
        }
        else if (card.swiped == "left") {
          choice = -1;
        }
        storedVotes.push(
          {
            "voteNumero": card.cardData.voteNumero,
            "choice": choice,
            "weight": weight
          }
        )
      }
      Storage.set({ key: "votes", value: JSON.stringify(storedVotes) })
    })
    this.props.history.push("/categories?second=true")
  }

  render() {
    const cardStack = this.cardStackRef.current
    return <div>
      <IonPage style={{ overflow: "auto", justifyContent: "flex-start" }}>
        <div className={cx("center-body")}>
          <div className={cx("body")}>
            {this.state.questions.map(question => <Question question={question} />)}
          </div>
        </div>
      </IonPage>
      <Header title={this.params.get("theme") + '\u00A0' + "1/??"} onBackClick={() => this.back()} />
      <Buttons />
    </div>
  }
}


export default withRouter(Questions)