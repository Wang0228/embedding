
let getEmbedding=async function(question, OPENAI_API_KEY, QAChinese, QAEmbedding) {
    const url = "https://api.openai.com/v1/embeddings";
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            input: question,
            model: "text-embedding-ada-002"
        })
    });
    const data = await response.json();
    return await cosineSimilarity(data.data[0].embedding, QAChinese, QAEmbedding, question, OPENAI_API_KEY)
}


let cosineSimilarity=function(qe, qc, qae, q, OPENAI_API_KEY) {
    //qe問題向量 qc中文集 qae 比對向量集
    let similarity = [];
    let answer = [{"role":"system","content":q+"?"+"請以以下資訊回答上方問題的答案:"}];
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;
    for (let l = 0; l < qae.length; l++) {
        for (let i = 0; i < qae[0].length; i++) {
            dotProduct += qae[l][i] * qe[i];
            magnitudeA += qae[l][i] * qae[l][i];
            magnitudeB += qe[i] * qe[i];
        }
        magnitudeA = Math.sqrt(magnitudeA);
        magnitudeB = Math.sqrt(magnitudeB);
        similarity.push(dotProduct / (magnitudeA * magnitudeB));
        dotProduct = 0;
        magnitudeA = 0;
        magnitudeB = 0;
    }
    let result = similarity.map((value, index) => [index, value]);
    result.sort((a, b) => b[1] - a[1]);
    if(result[0][1]<0.8)//這裡是填相似度最低為多少才跑gpt,不足會回傳-1 OuOb 
    {
        return -1;
    }
    
    let top2 = result.slice(0, 2).map(item => item[0]);
    top2.forEach(index => {
        answer[0].content += qc[index];
    })
    return answer;
    //gptanswer(answer,OPENAI_API_KEY);
    top2 = [], similarity = []
}


let gptanswer=async function(mes,OPENAI_API_KEY){
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
        model:"gpt-3.5-turbo",
        messages: mes,
        max_tokens: 1000,
        temperature: 0.7,
        n: 1
    })  
});
const data = await response.json();
console.log(data.choices[0].message);
}

let ZiHaoModule={
    getEmbedding:getEmbedding,cosineSimilarity:cosineSimilarity,gptanswer:gptanswer
};
export default ZiHaoModule;
