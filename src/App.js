import './App.css';
import { Form, Button, Col, Container, Row } from 'react-bootstrap';
import axios from 'axios';
import { useState } from 'react';
import jishoApi from 'unofficial-jisho-api';
const jisho = new jishoApi();

const PROXY = window.location.hostname === "localhost"
  ? "https://cors-anywhere.herokuapp.com"
  : "/cors-proxy";

function App() {
  const [loading, setIsLoading] = useState(false);
  const [message, setMessage] = useState();

  const onSubmit = async (event) => {
    const form = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();

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
          <Col>
            <h1>Ankify</h1>
          </Col>
        </Row>
        <Row>
          <Col>
            <Form onSubmit={onSubmit}>
              <Form.Group>
                <Form.Label>
                  <p>Enter words separated by a new line.</p>
                </Form.Label>
                <Form.Control
                  name="words"
                  as="textarea"
                  rows={20}
                  placeholder={'時間\n友達\n悲観的\nアホ\n微妙'}
                />
              </Form.Group>
              {loading ? (
                <Button className="btn btn-primary" type="button" disabled>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  {' '}Generating...{message}
                </Button>
              ) : (
                <Button className="btn btn-primary" type="submit">
                  Create Flash Cards
                </Button>
              )}
            </Form>
          </Col>
          <Col>
              <h4>How to use</h4>
              <p>
                <ol>
                  <li>Enter the words, separated by a space.</li>
                  <li>Click Create Flash Cards</li>
                  <li>Download the file</li>
                  <li>Open Anki, navigate to Decks, then Import File...</li>
                  <li>Select the downloaded file.
                    <ol>
                      <li><strong>Type</strong>: Japanese (recognition&amp;recall)</li>
                      <li><strong>Fields Separated By</strong>: if 'Tab' isn't already detected, enter the tab character: \t</li>
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
                  <li>ペラペラになる!</li>
                </ol>
              </p>
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
