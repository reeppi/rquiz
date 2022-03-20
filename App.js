/*
 * @format
 * @flow strict-local
 */
 //import * as data from './test.json';
 import React, {useState, useEffect} from 'react';
 import {
   SafeAreaView,
   ScrollView,
   StyleSheet,
   Text,
   View,
   TouchableOpacity,
   Button,
   Alert,
   TextInput,
 } from 'react-native';

var answers = [];
var nr = 0;
var strNameQuiz = '';
const iC = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

var data= {
  name: "empty",
  title: "Loading",
  questions: [
      {
      text: "Loading...",
      options: [ "...", "...", "...", "..."  ],
      true: 1
      },
  ]
}

var scoreboardData= {
  name: "...",
  scores: [
  {name:"Loading",score:1},
  {name:"Loading",score:2},
  {name:"Loading",score:3},
  ]
}

const BASE_URL_OFFLINE="http://192.168.0.101:8888";
const BASE_URL_ONLINE="https://reeppi-quiz.netlify.app";
const localApi=false;

const App = () => {
  //useEffect(() => {  }, []);
   const readJsonQuiz = (quizName,onlyData)  => {
   const controller = new AbortController();
   const timeoutId = setTimeout(() => controller.abort(), 6000);
   fetch(localApi ?BASE_URL_OFFLINE+'/quiz?name='+quizName:BASE_URL_ONLINE+'/quiz?name='+quizName, { signal: controller.signal })
   .then (  response => { return response.json() } )
   .then(dataR => 
     {
      clearTimeout(timeoutId);
      if (dataR.hasOwnProperty('error') )
      {   
          setJsonError( <Text style={{color: "#ff3d1f"}} >{dataR.error}</Text> );
      } else {
        data=dataR;   
        setOption(null);
        if ( !onlyData)
        {
          setQuestion(data.questions[0]);
          setJsonError('Liityit visaan '+quizName);  
          answers  = [];
          nr=0;
          setPageNumber(1);
        }
      }
    //  Alert.alert("Alert Title", "My Alert Msg "+data.questions[0].text);
     }  
     ).catch(() => {  clearTimeout(timeoutId); setJsonError(  <Text style={{color: "#ff3d1f"}} >Yhteys virhe</Text> ) } )
 }

const readJsonScoreboard = (quizName) => 
{
  //Alert.alert("Alert Title", "Reading scoreboard "+strNameQuiz);
   const controller = new AbortController();
   const timeoutId = setTimeout(() => controller.abort(), 6000);
   fetch(localApi ?BASE_URL_OFFLINE+'/scoreboard?name='+quizName:BASE_URL_ONLINE+'/scoreboard?name='+quizName, { signal: controller.signal })
   .then (  res => { return res.json() } )
   .then(dataR => 
     {
      clearTimeout(timeoutId);
      if (dataR.hasOwnProperty('error') )
      {   
        setJsonError( <Text style={{color: "#ff3d1f"}} >{dataR.error}</Text> );
        setScoreboard(scoreboardData);
      } else 
      {
        setJsonError("");
        setScoreboard(dataR);
        setDisabledScoreButton(false);
        setPageNumber(3); 
      }
     }  
     ).catch(() => { clearTimeout(timeoutId); setJsonError( <Text style={{color: "#ff3d1f"}} >Yhteys virhe</Text> ) })
}

const addscore = async(quizName,name,score) =>
{
  try {
    var url="";
      if ( localApi ) 
        url=BASE_URL_OFFLINE+'/addscore?name='+quizName+'&scorename='+name+'&score='+score
      else
        url=BASE_URL_ONLINE+'/addscore?name='+quizName+'&scorename='+name+'&score='+score
    var response = await fetch(url);
    if ( !response.ok) { setJsonError(<Text style={{color: "#ff3d1f"}}>Virheellinen vastaus palvelimelta.</Text>); return;} 
    var dataR = await response.json();
    if (dataR.hasOwnProperty('error') )
    {   
      setJsonError(<Text style={{color: "#ff3d1f"}}>{dataR.error}</Text> )
      setDisabledScoreButton(false);
    } else 
    {
      readJsonScoreboard(strNameQuiz);
    }
  }
  catch(e)
  {
    setJsonError( <Text style={{color: "#ff3d1f"}} >Yhteys virhe</Text> );
    setDisabledScoreButton(false);
  }
}

const scoreEntry = ({name,score},index) => {
  const bgColor = index%2  ? "#8bdff0" : "#e1edeb";
  return (
    <View key={index} style={{ flex: 1, alignSelf: 'stretch', flexDirection: 'row', backgroundColor: bgColor }}>
    <View style={{ marginLeft:5, borderWidth:0, flex: 0, alignSelf: 'stretch',width:20 }}><Text>{index+1}.</Text></View> 
    <View style={{ borderWidth:0, flex: 0, alignSelf: 'stretch',width:150  }}><Text>{name}</Text></View> 
    <View style={{ borderWidth:0, flex: 1, alignSelf: 'stretch' }}><Text>{score}</Text></View> 
    </View>
    );
}

const [scoreboard,setScoreboard] = useState(scoreboardData);
const  ScoreBoardPage = () =>
   {
     return (
      <View>
      <Text style={styles.sectionTitle}>Pistetaulu <Text style={styles.sectionTitleSmall}>{scoreboard.name}</Text></Text>
      {
        scoreboard.scores.sort((a,b)=>(b.score - a.score)).map( (item,index)=>scoreEntry(item,index))
      }
      <ErrorText/>
      <Button onPress={()=>{ setPageNumber(0);  }} title="Alkuun"/>
      </View>
     )
   }


  const Separator = () => <View style={styles.separator} />;

  const [valOption, setOption] = useState(null);
  const Option = (item, index) => {
     const bgColor = index === valOption ? "#8bdff0" : "#e1edeb";
     return (
     <View key={index}>
      <TouchableOpacity style={{backgroundColor: bgColor, padding:10}} onPress={() => setOption(index)}>
       <Text>{iC[index]}) {item}</Text>
      </TouchableOpacity>
     </View>)
   }

  
   const ResultsOption = (item,index,qIndex) => {
    var bgColor=""; 
    var show=true;
    if ( answers[qIndex] == data.questions[qIndex].true && index == answers[qIndex] ) 
    {
       bgColor = "#8eeb86";
    } 
    else if  ( (answers[qIndex] != data.questions[qIndex].true ) && index == answers[qIndex] )  {
      bgColor = "#ff3d1f";
    }
    else if  (  data.questions[qIndex].true == index )  {
      bgColor = "#fcff2e";
    }
    else {
      show=false;
      bgColor = "#e1edeb";
    }
    return (
    <View key={index} style={{backgroundColor: bgColor}}>
    { show && <Text style={{marginLeft:5}}>{iC[index]}) {item}</Text> }
    </View>)
  }

 
   const nextQuestion = () =>
   {
     if ( nr < data.questions.length-1 )
     {
       answers[nr]=valOption;
       nr++;
       setOption(null);
       setJsonError("");
       setQuestion(data.questions[nr]);
     } else {
       answers[nr]=valOption;
       nr=0;
       setPageNumber(2); 
     }
   }
 
   const [question,setQuestion] = useState(data.questions[0]);
   const  QuizPage = () =>
   {
     return (
      <View>
      <Text style={styles.sectionTitle}>Tietovisa <Text style={styles.sectionTitleSmall}>{data.title}</Text></Text>
      <Text style={{marginLeft:2}}>{ (nr+1)}. {  question.text } </Text>
      {
        question.options.map( (item,index)=>Option(item,index))
      }
      <Button title="Seuraava" onPress={ ()=> nextQuestion() } />
      </View>
     )
   }
      
   const  ResultsPage = () =>
   {
    var corAns=0;
    for (let i=0;i<data.questions.length;i++)
    {
       if ( answers[i] == data.questions[i].true ) 
         corAns++;
    }
    return (
      <View>
     <Text style={styles.sectionTitle}>Vastaukset <Text style={styles.sectionTitleSmall}>{data.title}</Text></Text>
     <AddScoreBoardPage score={corAns}/>
      {
        data.questions.map( (item,qIndex)=> {
          return( 
          <View key={qIndex}>
          <Text>{qIndex+1}. {item.text}</Text>
          {
             item.options.map( (item1,index)=>ResultsOption(item1, index, qIndex))
          }
          <Separator/>
          </View>
          )
        })
      }
      <Text>Oikeat vastaukset {corAns}/{data.questions.length}</Text>
      <Button title="Alkuun" onPress={ ()=> { answers=[]; setJsonError(""); setOption(null); nr=0; setPageNumber(0); setQuestion(data.questions[nr]); } } />
      <JoinQuiz/>
      </View>
     )
   }

   const [jsonError,setJsonError] = useState('');
   const ErrorText = () => 
   {
      return ( jsonError !="" && (<Text>{jsonError}</Text>)  )
   }



   const JoinQuiz = (props) => {   
    const [nameQuiz,setNameQuiz]  = useState(strNameQuiz);
    return (
        <View>{props.children}
        <Separator/>
        <Text style={styles.defaultText}>Anna visan tunnus :</Text> 
        <View style={{flexDirection:"row"}}> 
          <View style={{backgroundColor: "#e1edeb", flex:0.7}}>
            <TextInput value={nameQuiz} onChangeText={(e)=>{ strNameQuiz=e; setNameQuiz(e)}} style={[styles.defaultText,{padding:0}]}/>
          </View>
          <View style={{flex:0.3}}>
            <Button  onPress={()=>{ strNameQuiz=nameQuiz; readJsonQuiz(nameQuiz,false);   }} title="Aloita visa"/>
          </View>
        </View>
        <View style={{height:10}}/>
        <View style={{flexDirection:"row"}}> 
          <View style={{flex:0.7}}/>
          <View style={{flex:0.3}}>
            <Button onPress={()=>{ strNameQuiz=nameQuiz; readJsonScoreboard(nameQuiz);  }} title="Pistetaulu"/>
          </View>
        </View>
        <ErrorText/>
        <Separator/>
        </View>
    )
  }

  const [disabledScoreButton, setDisabledScoreButton] = useState(false);
  const AddScoreBoardPage = ({score}) => {   
    const [scorename,setScorename]  = useState();
    return (
        <View>
        <Separator/>
        <Text>Anna nimimerkkisi:</Text> 
        <View style={{flexDirection:"row"}}> 
          <View style={{backgroundColor: "#e1edeb", flex:0.7}}>
            <TextInput value={scorename} onChangeText={(e)=>{setScorename(e)}} style={{padding:0}}/>
          </View>
          <View style={{flex:0.3}}>
            <Button disabled={disabledScoreButton} onPress={()=>{ setDisabledScoreButton(true); var sName; if  ( scorename == undefined ) sName=""; else sName=scorename;  addscore(strNameQuiz,sName,score);  }} title={disabledScoreButton?"Avataan pistetaulua":"Lisää pistetauluun"}/>
          </View>
        </View>
        <ErrorText/>
        <Separator/>
        </View>
    )
  }

  const JoinQuizPage = (props) => 
  {
      return (  
        <JoinQuiz><Text style={styles.sectionTitle}>Tietovisa</Text></JoinQuiz> 
      )
  }

  const [pageNumber, setPageNumber] = useState(0);
   return (
     <SafeAreaView>
       <ScrollView contentInsetAdjustmentBehavior="automatic">
        {pageNumber === 0 && <JoinQuizPage/> }
        {pageNumber === 1 && <QuizPage />}
        {pageNumber === 2 && <ResultsPage />}
        {pageNumber === 3 && <ScoreBoardPage/>}
       </ScrollView>
     </SafeAreaView>
   );
 };

 const styles = StyleSheet.create({
  defaultText: {
    fontSize: 16,
  },
   sectionTitle: {
     fontSize: 24,
     fontWeight: '600',
   },
   sectionTitleSmall: {
    fontSize: 16,
    fontWeight: '600',
  },
   sectionDescription: {
     marginTop: 1,
     fontSize: 10,
     fontWeight: '400',
   },
   separator: {
    marginVertical: 8,
    borderBottomColor: '#737373',
    borderBottomWidth: StyleSheet.hairlineWidth,
  }
 });
 
 export default App;

 