import React from "react";
import Recorder from "./vendor/components/Recorder.js";
import {
  StyledWrapper,
  StyledRecorderWrapper,
  StyledWrapperRecorderInner,
  StyledTranscribedText,
  StyledAceWrapper,
  StyledVisualizerWrapper,
  StyledWindowWrapper,
  StyledVisualizerContainer,
  LoadingWrapper,
  StyledRefreshWrapper,
  StyledRefreshIcon,
} from "./styles/AppStyles";
import axios from "axios";
import "./App.css";
import rd3 from "react-d3-library";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-solarized_dark";
import { SSE } from "sse.js";
import {
  node,
  node2,
  vis,
  vis2,
  draw,
  settimer1ValueIncrease,
  settimer2ValueIncrease,
  defaultTimer1Value,
  defaultTimer2Value,
} from "./WaveAnimation.js";
import GPT3_JSON from "./credentials/GPT3Key.json";

const RD3Component = rd3.Component;

const origin_storytell =
  "<|endoftext|>/* I start with a blank HTML page, and incrementally modify it via <script> injection. Written for Chrome. I add \n after each line of code *//* Command: Add \"Hello World\", by adding an HTML DOM node */let helloWorld = document.createElement('div');\nhelloWorld.innerHTML = 'Hello World';\ndocument.body.appendChild(helloWorld);\n/* Command: Clear the page. */while (document.body.firstChild) {  document.body.removeChild(document.body.firstChild);}";
const stop_at = "/* Command:";

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      audioDetails: {
        url: null,
        blob: null,
        chunks: null,
        duration: {
          h: 0,
          m: 0,
          s: 0,
        },
      },
      d3: "",
      d3node2: "",
      loadingSpeechToText: false,
      transcribedText: null,
      activated: false,
      code: null,
    };
  }

  componentDidMount() {
    setInterval(() => {
      draw();
      this.setState({
        d3: node,
        d3node2: node2,
      });
    }, 30);
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevState.activated && this.state.activated) {
      vis.attr("class", "trigBottom");
      vis2.attr("class", "trigBottom");
    }
  }

  static getDerivedStateFromProps(props, state) {
    return {
      ...state,
      d3: node,
    };
  }

  updateIframe() {
    const iframe = document.getElementById("preview"),
      iframeWin = iframe.contentWindow || iframe,
      iframeDoc = iframe.contentDocument || iframeWin.document;

    iframeDoc.open();
    iframeDoc.write("<body></body>");
    iframeDoc.write(`<script>(function(){${this.state.code}})();</script>`);
    iframeDoc.close();
  }

  handleAudioStop(data) {
    settimer1ValueIncrease(defaultTimer1Value);
    settimer2ValueIncrease(defaultTimer2Value);
    this.setState({ audioDetails: data }, () => {
      // upload data, clear component
      let data = new FormData();
      data.append("file", this.state.audioDetails.blob);
      const config = {
        header: {
          "Content-Type": "multipart/form-data",
        },
      };

      this.setState(
        {
          loadingSpeechToText: true,
        },
        () => {
          axios.post("http://localhost:8080", data, config).then((response) => {
            // handle success
            this.setState(
              {
                transcribedText: response.data.transcription,
                code: this.state.code
                  ? this.state.code +
                    "\n/* Command: " +
                    response.data.transcription +
                    " */\n"
                  : "/* Command: " + response.data.transcription + " */\n",
                activated: true,
                loadingSpeechToText: false,
                loadingTextToCode: true,
              },
              () => {
                // send data to GPT-3 for computing
                const sse = SSE(
                  "https://api.openai.com/v1/engines/davinci-codex/completions",
                  {
                    headers: {
                      Authorization: `Bearer ${GPT3_JSON.GPT3_APP_KEY}`,
                      "Content-Type": "application/json",
                    },
                    payload: JSON.stringify({
                      prompt: origin_storytell + this.state.code,
                      max_tokens: 1000,
                      temperature: 0,
                      stream: true,
                      stop: stop_at,
                    }),
                  }
                );

                sse.addEventListener("message", (e) => {
                  // Assuming we receive JSON-encoded data payloads:
                  if (e.data !== "[DONE]") {
                    const responseData = JSON.parse(e.data);
                    const lineOfCode =
                      responseData &&
                      responseData.choices[0] &&
                      responseData.choices[0].text;
                    if (lineOfCode)
                      this.setState(
                        {
                          code: this.state.code + lineOfCode,
                        },
                        () => {
                          this.updateIframe();
                        }
                      );
                  } else {
                    sse.close();
                    this.setState({
                      loadingTextToCode: false,
                    });
                  }
                });
                sse.stream();
              }
            );
          });
        }
      );
    });
  }

  handleReset() {
    const reset = {
      url: null,
      blob: null,
      chunks: null,
      duration: {
        h: 0,
        m: 0,
        s: 0,
      },
    };
    this.setState({ audioDetails: reset });
  }

  render() {
    return (
      <StyledWrapper>
        <RD3Component data={this.state.d3} />
        <RD3Component data={this.state.d3node2} />
        {this.state.activated ? (
          <StyledVisualizerWrapper>
            <StyledVisualizerContainer>
              {this.state.code ? (
                <StyledRefreshWrapper
                  onClick={() => {
                    this.setState({
                      code: "",
                    });
                  }}
                >
                  <StyledRefreshIcon />
                </StyledRefreshWrapper>
              ) : null}
              {this.state.loadingTextToCode ? (
                <LoadingWrapper>
                  <div className="lds-ripple-contrast">
                    <div></div>
                    <div></div>
                  </div>
                </LoadingWrapper>
              ) : null}
              <StyledWindowWrapper>
                <iframe
                  id="preview"
                  width="100%"
                  height="100%"
                  title="Preview"
                />
              </StyledWindowWrapper>
              <StyledAceWrapper>
                <AceEditor
                  mode="javascript"
                  theme="solarized_dark"
                  onChange={(value) => {
                    this.setState({
                      code: value,
                    });
                  }}
                  name="ace-editor"
                  editorProps={{ $blockScrolling: true }}
                  value={this.state.code}
                  setOptions={{
                    useWorker: false,
                  }}
                  style={{
                    width: "400px",
                    height: "100%",
                  }}
                  onBlur={() => {
                    this.updateIframe();
                  }}
                />
              </StyledAceWrapper>
            </StyledVisualizerContainer>
          </StyledVisualizerWrapper>
        ) : null}
        <StyledRecorderWrapper activated={this.state.activated}>
          <StyledWrapperRecorderInner>
            {this.state.transcribedText ? (
              <StyledTranscribedText>
                <span>{this.state.transcribedText}</span>
              </StyledTranscribedText>
            ) : null}
            <Recorder
              record={true}
              title={"New recording"}
              audioURL={this.state.audioDetails.url}
              handleAudioStop={(data) => this.handleAudioStop(data)}
              handleReset={() => this.handleReset()}
              mimeTypeToUseWhenRecording={`audio/webm;codecs=opus`} // For specific mimetype.
              hideHeader
              hideControls
              onRecordingStart={() => {
                settimer1ValueIncrease(0.018);
                settimer2ValueIncrease(0.022);
                this.setState({
                  transcribedText: null,
                });
              }}
              onAudioPause={() => {
                settimer1ValueIncrease(defaultTimer1Value);
                settimer2ValueIncrease(defaultTimer2Value);
              }}
              onAudioStart={() => {
                settimer1ValueIncrease(0.018);
                settimer2ValueIncrease(0.022);
              }}
              loading={this.state.loadingSpeechToText}
              showHint={!this.state.activated}
            />
          </StyledWrapperRecorderInner>
        </StyledRecorderWrapper>
      </StyledWrapper>
    );
  }
}

export default App;
