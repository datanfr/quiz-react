import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Fab } from '@material-ui/core';
import classNames from 'classnames/bind';
import React, { PureComponent } from 'react';
import Header from '../components/Header';
import classes from './ChooseCategory.module.css';


let cx = classNames.bind(classes);

interface Props { }
interface State { }

const categories = [
  "Education nationale",
  "Santé",
  "Écologie",
  "Intérieur",
  "Affaires étrangères",
  "Économie & Finances",
  "Justice",
  "Culture",
  "Enseignement supérieur"
]

function groupBy(arr: any[], len: number) {
  var chunks = [], i = 0, n = arr.length;
  while (i < n) {
    chunks.push(arr.slice(i, i += len));
  }
  return chunks;
}

class ChooseCategory extends PureComponent<Props, State> {

  params : URLSearchParams;

  constructor(props: Props) {
    super(props);
    this.params = new URLSearchParams(window.location.search)
  }

  componentDidMount() {
  }

  render() {
    const categoryElem = (category: string) => <div className={cx("flex", "margin")}>
      {category && <a className={cx("flex", "no-decoration")} href={`/importance?theme=${category}`}>
        <div className={cx("flex", "datan-blue-bg", "round-corner", "align-justify-center", "text-center", "shadow-2")}>
          {category}
        </div>
      </a>}
    </div>

    const categoryiesElements = groupBy(categories, 2).map(categoryPair => <div className={cx("flex")}>
      {categoryElem(categoryPair[0])}
      {categoryElem(categoryPair[1])}
    </div>)

    return <div>
      <div className={cx("fullscreen", "flex", "column")}>
        <Header />
        <div className={cx("margin")}>
          {!this.params.get("second") 
            ?<h4>Choisissez une catégorie pour commencer:</h4>
            :<h4>Choisissez plus de catégories pour améliorer les résultats</h4>
          }
        </div>
        <div className={cx("flex", "column")}>
          {categoryiesElements}
        </div>
        {this.params.get("second") && <div className={cx("fab", "datan-green-bg", "round-corner", "shadow-3")}>
          <div className={cx("margin")} onClick={() => window.location.href="/resultat"}>Résultats</div>
        </div>}
      </div>
    </div>
  }
}

export default ChooseCategory