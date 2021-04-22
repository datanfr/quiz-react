import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames/bind';
import React, { PureComponent } from 'react';
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
    const categoryElem = (category: string) => category && <div className={cx("category-pair-padding")}>
      <a className={cx("link")}  href={`/questions?theme=${category}`}>
        <div className={cx("category")}>
          {category}
        </div>
      </a>
    </div>

    const categoryiesElements = groupBy(categories, 2).map(categoryPair => <div className={cx("category-pair")}>
      {categoryElem(categoryPair[0])}
      {categoryElem(categoryPair[1])}
    </div>)

    return <div className={cx("container", "page")}>
      <div className={cx("container", "header")}>
        <div className={cx('padding')}>
          <FontAwesomeIcon icon={faChevronLeft} />
        </div>
        <div className={cx('padding')}>
          <img src="https://datan.fr/assets/imgs/datan/logo_svg.svg" width="150" alt="Logo Datan"></img>
        </div>
      </div>

      <div className={cx("container", "categories")}>
        {categoryiesElements}
      </div>
    </div>
  }
}

export default ChooseCategory