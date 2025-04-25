import { useDemoContext } from "../utils/DemoContext"
import "./DemoPopUp.css"

const DemoPopUp = () => {
    const { showDemoPopUp, setShowDemoPopUp } = useDemoContext()

    return (
        <div className="DemoPopUp">
            <div className={`overlay ${showDemoPopUp ? "show" : ""}`}>
                <div className="container">
                    <header>
                        <h3 className="headline">Explore All Features with a Demo Account</h3>
                    </header>
                    <main>
                        <section>
                            <h4 className="subheadline">Full Access</h4>
                            <p>
                                <span className="highlight">Try the full experience without signing up</span>
                                <span className="plaintext"> - create blogs, preview and edit posts, comment on any blog, and delete your content anytime.</span>
                            </p>
                        </section>
                        <section>
                            <h4 className="subheadline">Private & Isolated</h4>
                            <p>
                                <span className="plaintext">Your demo blogs and comments are </span>
                                <span className="highlight">visible only to you.</span>
                                <span className="plaintext"> No one else can view your account.</span>
                            </p>
                        </section>
                        <section>
                            <h4 className="subheadline">Temporary Session</h4>
                            <p>
                                <span className="plaintext">You'll have a </span>
                                <span className="highlight">30-minute session.</span>
                                <span className="plaintext"> Once it ends or you log out, your demo account and all content will be deleted.</span></p>
                        </section> 
                        <section>
                            <p>
                                <span className="plaintext">Want to keep your content and engage with others? Sign up to create your own permanent account.</span>
                            </p>
                        </section>
                    </main>
                    <button className="btn okay" onClick={()=>setShowDemoPopUp(false)}>Got it</button>
                </div>
            </div>
        </div>
    )
}

export default DemoPopUp

// © 2025 Pitipat Pattamawilai. All Rights Reserved.