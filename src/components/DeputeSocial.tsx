import classNames from 'classnames/bind';
import { useEffect } from 'react';
import classes from '../pages/DeputeStats.module.css';
let cx = classNames.bind(classes);



export const DeputeSocials = () => {

    const urlQuizz = "https://datan.fr" // A CHANGER
    const message = "Je viens de faire le nouveau quizz politique sur Datan. Son objectif ? Savoir si j'ai les mêmes idées politiques que mon député ! Découvre aussi ce quizz :";

    function socialWindow(url: string) {
        const left = (window.screen.width - 570) / 2;
        const top = (window.screen.height - 570) / 2;
        const params = "menubar=no,toolbar=no,status=no,width=570,height=570,top=" + top + ",left=" + left;
        window.open(url, "NewWindow", params);
    }

    const facebookClick = () => {
        var url = "https://www.facebook.com/sharer.php?u=" + urlQuizz;
        socialWindow(url);
    }

    const linkedinClick = () => {
        const url = "https://www.linkedin.com/sharing/share-offsite/?url=" + urlQuizz;
        socialWindow(url);
    }

    const whatsappClick = () => {
        var url = "whatsapp://send?text=" + message + " " + urlQuizz;
        socialWindow(url);
    }

    const twitterClick = () => {
        var url = "https://twitter.com/intent/tweet?url=" + urlQuizz + "&text=" + message;
        socialWindow(url);
    }

    return <div className={cx("share-link")}>
        <div style={{ fontWeight: 800, color: "#4D5755", fontSize: "1.1em", textAlign: "center" }}>Invite tes amis à faire ce quizz</div>
        <div className={cx("share-btn-container")}>
            <div>
                <button type="button" name="button" className={cx("twitter")} onClick={twitterClick}>
                    <img src="/assets/social-media/twitter-no-round.png" alt="Partagez sur Twitter" />
                    <span>Twitter</span>
                </button>
            </div>
            <div>
                <button type="button" name="button" className={cx("facebook")} onClick={facebookClick} >
                    <img src="/assets/social-media/facebook-no-round.png" alt="Partagez sur Facebook" />
                    <span>Facebook</span>
                </button>
            </div>
            <div>
                <button type="button" name="button" className={cx("linkedin")} onClick={linkedinClick}>
                    <img src="/assets/social-media/linkedin-no-round.png" alt="Partagez sur Linkedin" />
                    <span>Linkedin</span>
                </button>
            </div>
            <div className={cx("mobileShow")}>
                <button type="button" name="button" className={cx("whatsapp")} onClick={whatsappClick}>
                    <img src="/assets/social-media/whatsapp-no-round.png" alt="Partagez sur Whatsapp" />
                    <span>Whatsapp</span>
                </button>
            </div>
        </div>
    </div>
}
