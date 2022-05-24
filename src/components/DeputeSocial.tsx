import classNames from 'classnames/bind';
import { useEffect } from 'react';
import classes from '../pages/DeputeStats.module.css';
let cx = classNames.bind(classes);



export const DeputeSocials = () => {

    
    
    const pageUrl = encodeURIComponent(document.URL);
    const ogDescriptionContent = document.querySelector("meta[property='og:description']")?.getAttribute("content")
    const tweet = ogDescriptionContent && encodeURIComponent(ogDescriptionContent);
    const whatsappMessage = "Je viens de découvrir un nouveau vote de l'Assemblée nationale sur Datan ! Découvre le aussi : " + document.URL;

    console.log({ pageUrl, ogDescriptionContent, tweet, whatsappMessage })

    function socialWindow(url: string) {
        const left = (window.screen.width - 570) / 2;
        const top = (window.screen.height - 570) / 2;
        const params = "menubar=no,toolbar=no,status=no,width=570,height=570,top=" + top + ",left=" + left;
        window.open(url, "NewWindow", params);
    }

    const facebookClick = () => {
        var url = "https://www.facebook.com/sharer.php?u=" + pageUrl;
        socialWindow(url);
    }

    const linkedinClick = () => {
        const url = "https://www.linkedin.com/sharing/share-offsite/?url=" + pageUrl;
        socialWindow(url);
    }

    const whatsappClick = () => {
        var url = "whatsapp://send?text=" + whatsappMessage;
        socialWindow(url);
    }

    const twitterClick = () => {
        var url = "https://twitter.com/intent/tweet?url=" + pageUrl + "&text=" + tweet;
        socialWindow(url);
    }

    return <div className={cx("share-link")} style={{ border: "2px solid black" }}>
        <div style={{ fontWeight: 800, color: "#4D5755", fontSize: "1.1em", textAlign: "center" }}>Partagez votre résultat</div>
        <div className={cx("share-btn-container")} style={{ border: "1px solid blue" }}>
            <button type="button" name="button" className={cx("twitter")} onClick={twitterClick}>
                <img src="/assets/social-media/twitter-no-round.png" alt="Partagez sur Twitter" />
                <span>Twitter</span>
            </button>
            <button type="button" name="button" className={cx("facebook")} onClick={facebookClick} >
                <img src="/assets/social-media/facebook-no-round.png" alt="Partagez sur Facebook" />
                <span>Facebook</span>
            </button>
            <button type="button" name="button" className={cx("linkedin")} onClick={linkedinClick}>
                <img src="/assets/social-media/linkedin-no-round.png" alt="Partagez sur Linkedin" />
                <span>Linkedin</span>
            </button>
            <button type="button" name="button" className={cx("whatsapp")} onClick={whatsappClick}>
                <img src="/assets/social-media/whatsapp-no-round.png" alt="Partagez sur Whatsapp" />
                <span>Whatsapp</span>
            </button>
        </div>
    </div>
}