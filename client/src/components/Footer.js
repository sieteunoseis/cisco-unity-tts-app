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
                <a href="https://twitter.com/SieteUnoSeis" rel="noopener noreferrer" target="_blank"><MDBIcon fab icon="facebook" className="mr-3" /></a>
                <MDBIcon fab icon="twitter" className="mr-3"/>
                <MDBIcon fab icon="youtube" className="mr-3"/>
                <MDBIcon fab icon="google-plus" className="mr-3"/>
                <MDBIcon fab icon="dribbble" className="mr-3"/>
                <MDBIcon fab icon="pinterest" className="mr-3"/>
                <MDBIcon fab icon="github" className="mr-3"/>
                <MDBIcon fab icon="codepen" className="mr-3"/>
            </div>
            <p className="footer-copyright mb-0 py-3 text-center">
                &copy; {new Date().getFullYear()} Copyright: <a href="https://automate.builders"> automate.builders </a>
            </p>
        </MDBFooter>
    );
}

export default Footer;