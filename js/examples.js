var xmlExamples = {
   average:{
      description:'Calculate average',
      xml:'<persons><person><name>William</name><age>31</age></person><person><name>Jane</name><age>29</age></person></persons>',
      query:'xml.persons.person.reduce(function(prev,cur){return parseInt(cur.age) + prev;},0) / xml.persons.person.length'
   }
}




