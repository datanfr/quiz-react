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

const { Storage } = Plugins;

let cx = classNames.bind(classes);

interface Props extends RouteComponentProps { }
interface State { questions: any[] }

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
    if (typeof weightStored.value == 'string'){
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
    return <IonPage><div className={cx("fullscreen", "flex", "column")}>
      <Header onBackClick={() => this.back()} />
      <div className={cx("flex", "flex-static", "datan-blue-bg")}><div className={cx('flex', 'margin')}>{this.params.get("theme")}</div></div>
      <div className={cx("flex", "align-justify-center", "basis-auto")}>
        {this.state.questions.length && <CardStack key={Math.random()} ref={this.cardStackRef} cardsData={this.state.questions}
          onAllCardsSwiped={(votes) => { this.saveVotes(votes) }}
        >
          {question => <div className={cx("flex", 'margin')}>
            <div className={cx("flex", "align-justify-center")}>
              {question.voteTitre}
            </div>
          </div>}
        </CardStack>}
      </div>
      <div className={cx("flex", "basis-auto")} style={{ justifyContent: "space-evenly", alignContent: "center" }}>
        <div
          className={cx("flex", "flex-static", "align-justify-center", "shadow", "button", "contre")}
          data-value="{'importance': 1, 'pour': -1}"
          onClick={e => this.cardStackRef.current?.swipeTopCard("left")}
        >
          <div className={cx('margin')}>
            <FontAwesomeIcon size="3x" icon={faFrown} />
          </div>
        </div>
        <div
          className={cx("flex", "flex-static", "align-justify-center", "shadow", "button", "osef")}
          data-value="{'importance': 0, 'pour': 0}"
          onClick={e => this.cardStackRef.current?.swipeTopCard("up")}
        >
          <div className={cx('margin')}>
            <FontAwesomeIcon size="3x" icon={faMeh} />
          </div>
        </div>
        <div
          className={cx("flex", "flex-static", "align-justify-center", "shadow", "button", "pour")}
          data-value="{'importance': 1, 'pour': 1}"
          onClick={e => this.cardStackRef.current?.swipeTopCard("right")}
        >
          <div className={cx('margin')}>
            <FontAwesomeIcon size="3x" icon={faSmile} />
          </div>
        </div>
      </div>
    </div></IonPage>
  }
}

export default withRouter(Questions)