import React, { Fragment, PureComponent } from 'react';
import classNames from 'classnames/bind';
import classes from './Questions.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome } from '@fortawesome/free-solid-svg-icons'
import CardStack from '../components/CardStack';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import { faSmile, faFrown, faMeh } from '@fortawesome/free-regular-svg-icons'
import Api from '../Api';

let cx = classNames.bind(classes);

interface Props { }
interface State { questions: any[] }

class Questions extends PureComponent<Props, State> {

  apiCall: Promise<any[]>
  cardStackRef: React.RefObject<CardStack<any>>

  constructor(props: Props) {
    super(props);
    this.cardStackRef = React.createRef();
    this.apiCall = Api.getCards('environnement', 5)
    this.state = {
      questions: []
    }

  }

  componentDidMount() {
    this.apiCall
      .then(
        resp => this.handleApiResponse(resp),
        e => this.handleApiError(e)
      )
  }

  handleApiError(e: Error) {
    const questions = [
      { "voteTitre": "environnement (1/6)", "description": "coucou" },
      { "voteTitre": "environnement (2/6)", "description": "hola" },
      { "voteTitre": "environnement (3/6)", "description": "hello" },
    ]
    console.log("Error caught putting fake questions data", e, questions)
    this.setState({ questions })
  }

  handleApiResponse(questions: any[]) {
    this.setState({ questions })
  }

  render() {
    const cardStack = this.cardStackRef.current
    return <div className={cx("container", "page")}>
      <div className={cx("container", "header")}>
        <div className={cx('padding')}>
          <FontAwesomeIcon icon={faChevronLeft} onClick={() => this.cardStackRef.current?.resetLastCard()} />
        </div>
        <div className={cx('padding')}>

          <img src="https://datan.fr/assets/imgs/datan/logo_svg.svg" width="150" alt="Logo Datan"></img>
        </div>
      </div>
      <div className={cx("container", "title")}><div className={cx('padding')}>Environnement</div></div>
      <div className={cx("container", "cards")}>
        {this.state.questions.length && <CardStack key={Math.random()} ref={this.cardStackRef} cardsData={this.state.questions}>
          {question => <div className={cx('padding')}>
            {question.voteTitre}<br />
            Hello i'm swipe card content<br />
            {question.description}<br />
          </div>}
        </CardStack>}
      </div>
      <div className={cx("container", "buttons")}>
        <div
          className={cx("container", "button", "contre")}
          data-value="{'importance': 1, 'pour': -1}"
          onClick={e => this.cardStackRef.current?.swipeTopCard("left")}
        >
          <div className={cx('padding')}>
            <FontAwesomeIcon size="3x" icon={faFrown} />
          </div>
        </div>
        <div
          className={cx("container", "button", "osef")}
          data-value="{'importance': 0, 'pour': 0}"
          onClick={e => this.cardStackRef.current?.swipeTopCard("up")}
        >
          <div className={cx('padding')}>
            <FontAwesomeIcon size="3x" icon={faMeh} />
          </div>
        </div>
        <div
          className={cx("container", "button", "pour")}
          data-value="{'importance': 1, 'pour': 1}"
          onClick={e => this.cardStackRef.current?.swipeTopCard("right")}
        >
          <div className={cx('padding')}>
            <FontAwesomeIcon size="3x" icon={faSmile} />
          </div>
        </div>
      </div>
    </div>
  }
}

export default Questions