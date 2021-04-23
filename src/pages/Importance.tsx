import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames/bind';
import React, { PureComponent } from 'react';
import Header from '../components/Header';
import classes from './ChooseCategory.module.css';


let cx = classNames.bind(classes);

interface Props { }
interface State { }

class Importance extends PureComponent<Props, State> {


  constructor(props: Props) {
    super(props);
  }

  componentDidMount() {
  }

  render() {

    return <div className={cx("fullscreen", "flex", "column")}>
      <Header onBackClick={() => window.location.href = "categories"} />
      <div className={cx("flex", "column", "margin")}>
        <div className={cx("flex", "flex-static")}>
          <h4>A quel point cette catégorie est importante pour vous ?</h4>
        </div>
        <div className={cx("flex", "flex-static")}>
          Merci de renseigner l'importance de cette catégorie. Cela nous aidera a améliorer la précision des résultats.
        </div>
      </div>
      <div className={cx("flex", "align-justify-center", "column")}>
        <div className={cx("flex", "align-justify-center")}>
          Ceci est un slider
      </div>
        <div className={cx("flex", "align-justify-center")}>
          Ceci est un indication sur la position du slider
      </div>
      </div>
      <div className={cx("flex", "align-justify-center")} onClick={() => window.location.href = "/questions"}>
        <div className={cx("margin")}>
          <div className={cx("flex", "datan-blue-bg", "round-corner")}>
            <div className={cx("margin")}>Commencer</div>
          </div>
        </div>
      </div>
    </div>
  }
}

export default Importance