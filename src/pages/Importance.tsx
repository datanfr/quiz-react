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
      <Header/>
      <div className={cx("flex")}>
        A quel point cette catégorie est importante pour vous ?
      </div>
      <div className={cx("flex")}>
        Merci de renseigner l'importance de cette catégorie. Cela nous aidera a améliorer la précision des résultats.
      </div>
      <div className={cx("flex")}>
        Ceci est un slider
      </div>
      <div className={cx("flex")}>
        Ceci est un indication sur la position du slider
      </div>
      <div className={cx("flex")} onClick={() => window.location.href="/questions"}>
        Ceci est le bouton valider (et je fonctionne)
      </div>
    </div>
  }
}

export default Importance