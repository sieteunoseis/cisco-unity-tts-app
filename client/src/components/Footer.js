import React from 'react';
import { MDBFooter, MDBBtn, MDBIcon } from 'mdbreact';

const Footer = () => {
    return (
        <MDBFooter color="blue" className="text-center font-small darken-2 pt-4 mt-4">
            <div className="pt-4">
                <MDBBtn outline color="white" tag="a" href="https://github.com/sieteunoseis/cisco-unity-tts-app/" target="_blank">Download Github<MDBIcon fab icon="github" className="ml-2"/></MDBBtn>
                <MDBBtn outline color="white" tag="a" href="https://medium.com/@jeremyworden/using-apis-to-automate-cisco-s-unity-connection-call-handlers-9ad71b1d973f" target="_blank">Medium write-up<MDBIcon fab icon="medium" className="ml-2"/></MDBBtn>
                <hr className="my4"/>
            </div>
            <div className="pb-4">
                <a href="https://www.facebook.com/jeremy.worden/" rel="noopener noreferrer" target="_blank"><MDBIcon fab icon="facebook" className="mr-3" /></a>
                <a href="https://twitter.com/SieteUnoSeis" rel="noopener noreferrer" target="_blank"><MDBIcon fab icon="twitter" className="mr-3"/></a>
                <a href="https://www.youtube.com/JeremyWorden" rel="noopener noreferrer" target="_blank"><MDBIcon fab icon="youtube" className="mr-3"/></a>
                <a href="https://www.linkedin.com/in/jeremyworden/" rel="noopener noreferrer" target="_blank"><MDBIcon fab icon="linkedin" className="mr-3"/></a>
                <a href="https://www.instagram.com/sieteunoseis/" rel="noopener noreferrer" target="_blank"><MDBIcon fab icon="instagram" className="mr-3"/></a>
                <a href="https://www.buymeacoffee.com/automatebldrs" rel="noopener noreferrer" target="_blank"><MDBIcon far icon="coffee-togo" className="mr-3"/></a>
                <a href="https://github.com/sieteunoseis/" rel="noopener noreferrer" target="_blank"><MDBIcon fab icon="github" className="mr-3"/></a>
                <a href="https://www.patreon.com/join/sieteunoseis/checkout" rel="noopener noreferrer" target="_blank"><MDBIcon fab icon="patreon" className="mr-3"/></a>
            </div>
            <p className="footer-copyright mb-0 py-3 text-center">
                &copy; {new Date().getFullYear()} Copyright: <a href="https://automate.builders"> automate.builders </a>
            </p>
        </MDBFooter>
    );
}

export default Footer;