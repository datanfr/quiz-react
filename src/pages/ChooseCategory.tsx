import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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


  constructor(props: Props) {
    super(props);
  }

  componentDidMount() {
  }

  render() {
    const categoryElem = (category: string) => category && <div className={cx("flex", "margin")}>
      <a className={cx("flex", "no-decoration")}  href={`/questions?theme=${category}`}>
        <div className={cx("flex", "datan-blue-bg", "centered", "round-corner")}>
          {category}
        </div>
      </a>
    </div>

    const categoryiesElements = groupBy(categories, 2).map(categoryPair => <div className={cx("flex")}>
      {categoryElem(categoryPair[0])}
      {categoryElem(categoryPair[1])}
    </div>)

    return <div className={cx("fullscreen", "flex", "column")}>
      <div className={cx("flex", "column")}>
        {categoryiesElements}
      </div>
    </div>
  }
}

export default ChooseCategory