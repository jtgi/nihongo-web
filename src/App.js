import './App.css';
import { Alert, Form, Button, Col, Container, Row } from 'react-bootstrap';
import axios from 'axios';
import { useState } from 'react';
import jishoApi from 'unofficial-jisho-api';
import Logo from './Logo';
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";

Sentry.init({
  dsn: "https://3ab33a3d8427430ea453577ff14524fa@o919812.ingest.sentry.io/5864333",
  integrations: [new Integrations.BrowserTracing()],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

const jisho = new jishoApi();

const PROXY = window.location.hostname === "localhost"
  ? "https://cors-anywhere.herokuapp.com"
  : "/cors-proxy";

function App() {
  const [loading, setIsLoading] = useState(false);
  const [message, setMessage] = useState();
  const [error, setError] = useState();

  const onSubmit = async (event) => {
    setError(null);

    const form = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();

    if(!form.words.value) {
      setError('You have to enter some words to study first.')
      return;
    }

    setIsLoading(true);
    const tsv = await fetch(form.words.value, setMessage);
    download(tsv);

    setIsLoading(false);
    console.log(tsv);
  }

  const download = (tsv) => {
    var encodedUri = `data:text/tsv;charset=utf-8,${encodeURIComponent(tsv)}`;
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `flash-cards-${Date.now()}.tsv`);
    document.body.appendChild(link); // Required for FF
    link.click();
  }

  return (
    <div className="App">
      <Container>
        <Row>
          <Col className="mt-5 mb-3" xs={6} md={3}>
            <Logo />
          </Col>
          <Col xs={6} md={9}>
            <h1 className="d-none d-lg-block" style={{marginTop: 110}}>Generate your Anki flashcards –with sample sentences 🍒</h1>
            <h2 className="d-none d-sm-block d-lg-none" style={{marginTop: 70}}>Generate your Anki flashcards –with sample sentences 🍒</h2>
            <h4 className="d-block d-sm-none" style={{marginTop: 70}}>Generate your Anki flashcards –with sample sentences 🍒</h4>
          </Col>
        </Row>
        <Row>
          <Col lg={6}>
            {error && <Alert variant={'danger'}>{error}</Alert>}
            <Form onSubmit={onSubmit}>
              <Form.Group>
                <div id="paper">
                  <div id="pattern">
                    <div id="content" style={{ position: 'relative' }}>
                      <Form.Label>
                        <p><strong>Enter each word on a new line</strong></p>
                      </Form.Label>
                      <div style={{ position: 'absolute', top: 35, left: 65 }} className="arrow bounce"></div>
                      <Form.Control
                        name="words"
                        as="textarea"
                        id="word-list"
                        style={{ marginTop: 25, marginLeft: '-8px', background: 'none', border: 'none' }}
                        order rows={20}
                        placeholder={'時間\n友達\n...'}
                      />
                    </div>
                  </div>
                </div>
              </Form.Group>
              {loading ? (
                <Button className="btn btn-primary" type="button" disabled>
                  <span className="spinner-border spinner-border-sm" variant="success" role="status" aria-hidden="true"></span>
                  {' '}Generating...{message}
                </Button>
              ) : (
                <Button className="btn btn-primary" variant="danger" type="submit">
                  Generate Flash Cards
                </Button>
              )}
            </Form>
          </Col>
          <Col className="mt-3">
            <h4>Examples</h4>
            <img alt="blabal" style={{marginBottom: 5}} className="flashcard-sample" height="320" width="49%" src={`${process.env.PUBLIC_URL}/fc1.png`} />&nbsp;
            <img alt="blabla2" className="flashcard-sample" height="320" width="49%" src={`${process.env.PUBLIC_URL}/fc2.png`} />
            <img alt="blabal23" style={{marginBottom: 5}} className="flashcard-sample" height="320" width="49%" src={`${process.env.PUBLIC_URL}/fc3.png`} />&nbsp;
            <img alt="alskjdaflks" className="flashcard-sample" height="320" width="49%" src={`${process.env.PUBLIC_URL}/fc4.png`} />
          </Col>
        </Row>

<br/><br/>
          <Row>
            <Col>
            <hr/>

            <h4>How to use</h4>
            <h5>Generate and Install the Deck</h5>
            <ol>
              <li>Enter the words, separated by a new line.</li>
              <li>Click Create Flash Cards</li>
              <li>Download the file</li>
              <li>Open Anki, navigate to Decks, then Import File...</li>
              <li>Select the downloaded file.
                <ol>
                  <li><strong>Type</strong>: Japanese (recognition&amp;recall)</li>
                  <li><strong>Fields Separated By</strong>: if 'Tab' isn't already detected, enter the tab sequence: <strong>\t</strong> (yes, 'backslash' then 't')</li>
                  <li><strong>Allow HTML in Fields</strong>: Checked</li>
                  <li><strong>Field mapping</strong>
                    <ul>
                      <li>Field 1 mapped to Expression</li>
                      <li>Field 2 mapped to Meaning</li>
                      <li>Field 3 mapped to Reading</li>
                      <li>Field 4 mapped to Usage</li>
                    </ul>
                  </li>
                </ol>
              </li>
              <li>Import</li>
              <li>ペラペラになる!</li>
            </ol>
            <h5>Update the card template to include sample sentences</h5>
            <ol>
              <li>Open Anki, navigate to Browse</li>
              <li>Click the 'Cards...' button</li>
              <li>Select Card Type 'Recognition' (or whatever other type you want to modify)</li>
              <li>Select Template 'Back Template'</li>
              <li>Wherever you want the examples to show up, add HTML <pre>{'<p style="font-size:14px">{{Usage}}</p>'}</pre>
              My complete template looks like: <pre>{`
{{FrontSide}}

<hr id=answer>

<div class=jp> {{furigana:Reading}} </div><br>
{{Meaning}}<br><br>
<p style="font-size:14px">{{Usage}}</p>
<br><br>
<p style="font-size:16px">{{Tags}}</p>`}</pre></li>
              <li>そして、ペラペラになる!</li>
            </ol>
          </Col>
          </Row>
      </Container>
    </div>
  );
}

async function fetch(words, setMessage) {
  if(!words) {
    return;
  }

  const strings = [];
  const terms = words.split("\n").map(w => w.trim());

  console.log(`populating ${terms.length} flash cards...`)
  for(let term of terms) {
    if (!term.trim()) {
      continue;
    }

      let isRedWord = false;
      if (term.startsWith("*")) {
          term = term.slice(1);
          isRedWord = true;
      }
      const renderedTerm = isRedWord ? `<span style="color:red;font-weight:bold">${term}</span>` : term;

      try {
          console.log('searching for', term);
          setMessage(term);
          const rsp = await axios.get(`${PROXY}/https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(term)}`);
          if (rsp.data?.data) {
              const def = rsp.data.data[0];
              const reading = def.japanese.find(d => d.word === term)?.reading || term;
              const [mainDef, ...otherDefs] = def.senses;
              console.log(otherDefs);
              const eigoDef = mainDef.english_definitions.join(", ");
              const usageCategory = mainDef.parts_of_speech.join(", ");
              
              let examples = ['None found'];
              try {
                  const exampleRsp = await jisho.searchForExamples(term);
                  examples = exampleRsp.results.slice(0, 3).map((result, idx) => `${idx + 1}. ${result.kanji}<br/>${result.kana}<br/>${result.english}`);
              } catch (error) {
                  examples = ['Error'];
                  console.error('failed searching for examples');
              }

              strings.push(`${renderedTerm}\t${eigoDef}<br/><small><italic>(${usageCategory})</italic></small>\t${reading}\t${examples.join("<br/><br/>")}`);
          } 
      } catch(error) {
          strings.push(`${renderedTerm}\tError\tError\tError`);
          console.error('Caught error, skipping', error);
      }
  }

  return strings.join("\n");
}


export default App;
