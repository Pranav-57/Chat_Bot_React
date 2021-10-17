import { useEffect, useState } from "react";
import { Avatar } from "@material-ui/core";
import useSpeechToText from "react-hook-speech-to-text";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");
  const [isSymptoms, setIsSymptoms] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [code, setCode] = useState(false);
  const { error, interimResult, isRecording, results, startSpeechToText, stopSpeechToText, } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
  });

  useEffect(() => {
    localStorage.setItem(
      "conversation",
      JSON.stringify([{ boy_reply: "My name is bot" }])
    );

    setConversation(JSON.parse(localStorage.getItem("conversation")));    
  }, [setConversation]);

  const sendResponse = async () => {
    const previou_reply = JSON.parse(localStorage.getItem("conversation"));

    let response_array = [];
    previou_reply.map((e) => {
      if (e.user_message) {
        response_array.push(e.user_message);
      }
    });

    if (results.at(-1) & !message) {
      if (results.at(-1).transcript) {
        response_array.push(results.at(-1).transcript);
        setMessage(results.at(-1).transcript);
      }
    }

    try {
      const response = await fetch("/predict/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: response_array,
          isSymptoms,
          code
        }),
      });

      const data = await response.json();

      let previous_conversation = JSON.parse(
        localStorage.getItem("conversation")
      );

      if (message) {
        console.log("jjkh");
      } else {
        if (results.at(-1)) {
          if (results.at(-1).transcript) {
            previous_conversation.push({
              user_message: results.at(-1).transcript,
            });
            // response_array.push(results.at(-1).transcript);
          }
        }
      }

      data.possible_diseases
        ? previous_conversation.push({ boy_reply: data.possible_diseases })
        : previous_conversation.push({ boy_reply: data.bot_reply });

      localStorage.setItem(
        "conversation",
        JSON.stringify(previous_conversation)
      );
      // setValue(data.bot_reply)
      setConversation(previous_conversation);
    } catch (error) {
      console.log(error);
    }
  };

  const sendMessage = async () => {
    let previous_conversation = JSON.parse(
      localStorage.getItem("conversation")
    );
    if (message) {
        previous_conversation.push({ user_message: message });
    }
    localStorage.setItem("conversation", JSON.stringify(previous_conversation));
    sendResponse();
    setConversation(previous_conversation);
    setMessage("");
  };

  const setCodeFunction = e => {
    setCode(e.target.value);
  }

  return (
    <>
      <div className="app">
        {
          !code && <div className="model">
            <div className="model_container">
              <h2>Select Language</h2>
              <hr className="my-0" />
              <div className="model_inner">
                <p className="mb-2">Select your language :- </p>
                <select onChange={setCodeFunction} name="" id="">
                  <option value={false}>Select</option>
                  <option value="mr">Marathi</option>
                  <option value="en">English</option>
                  <option value="hi">hindi</option>
                  <option value="gu">Gujrati</option>
                  <option value="ta">Tamil</option>
                  <option value="te">Telugu</option>
                  <option value="pa">Panjabi</option>
                  <option value="ur">Urdu</option>
                </select>
              </div>
            </div>
          </div>
        }
        <div className="chatbot mx-auto mb-5">
          <h5 className="fw-bold heading mb-0">Conversation with Bot</h5>
          <div className="conversation_body">
            {conversation.length
              ? conversation.map((messages, index) => {
                  return messages.boy_reply ? (
                    typeof messages.boy_reply === "object" ? (
                      <div className="bot_message d-flex align-items-center mb-3">
                        <Avatar alt="Bot" src="/static/images/avatar/1.jpg" />
                        <div className="message">
                          The possible dieseases with their probability based on
                          given symptoms are as follows :-
                          {messages.boy_reply.map((e) => {
                            return (
                              <div style={{ wordBreak: "break-word" }}>
                                {e.disease} -&gt; {e.probablities}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div
                        key={index}
                        className="bot_message d-flex align-items-center mb-3"
                      >
                        <Avatar alt="Bot" src="/static/images/avatar/1.jpg" />
                        <div className="message">{messages.boy_reply}</div>
                      </div>
                    )
                  ) : (
                    <div
                      key={index}
                      className="bot_message d-flex align-items-center mb-3 flex-row-reverse"
                    >
                      <Avatar
                        style={{ background: "rgb(66, 110, 255)" }}
                        src="/static/images/avatar/1.jpg"
                      />
                      <div className="message text_secondary">
                        {messages.user_message}
                      </div>
                    </div>
                  );
                })
              : "Nothing"}
          </div>
          <div className="d-flex">
            <button
              className="isSymptoms"
              onClick={() => {
                isSymptoms ? setIsSymptoms(false) : setIsSymptoms(true);
              }}
            >
              {isSymptoms ? "Click to ask a query" : "Click to diagnose the disease"}
            </button>
            <button className="mic_button" onClick={isRecording ? stopSpeechToText : startSpeechToText} >
              {isRecording ? (
                <i class="fas fa-microphone"></i>
              ) : (
                <i class="fas fa-microphone-slash"></i>
              )}
            </button>
          </div>
          
          <div className="message_container d-flex">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="message_box"
              type="text"
              placeholder="Ask something to bot...."
            />
            <button onClick={sendMessage} className="button">
              <i class="far fa-paper-plane"></i>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
