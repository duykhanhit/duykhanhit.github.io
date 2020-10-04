let info = {
    id: 1,
    title: 'task 1',
    description: 'task 1',
    type: 'task',
    priority: 'high',
    allowFor: ['back_end', 'front_end', 'function_test', 'performance_test'],
    createdBy: 'Joo',
    assignee: 'joo',
    estimate: '20/03/2020',
    state: 'todo'
};

let title = document.getElementById('title');
let type = document.getElementById('type');
let state = document.getElementById('state');
let description = document.getElementById('description');
let createdBy = document.getElementById('createdBy');
let assignee = document.getElementById('assignee');
let estimate = document.getElementById('estimate');

function getPriority(){
    var checkbox = document.getElementsByName('priority');
    for (var i = 0; i < checkbox.length; i++){
        if (checkbox[i].checked === true){
            return checkbox[i];
        }
    }
}

function getIssue(){
    var checkbox = document.getElementsByName('issue');
    let result = [];
    for (var i = 0; i < checkbox.length; i++){
        if (checkbox[i].checked === true){
            result.push(checkbox[i].value);
        }
    }
    return result;
}


var create = document.getElementById('onCreate');
create.addEventListener('click', function(){
    document.getElementById('display').style.display = "block";
});

var close = document.getElementById('close');
close.addEventListener('click', function(){
    document.getElementById('display').style.display = "none";    
});

var save = document.getElementById('save');
save.addEventListener('click', function(){
    info.title = title.value;
    info.description = description.value;
    info.type = type.value;
    info.priority = getPriority().value;
    info.allowFor = getIssue();
    info.createdBy = createdBy.value;
    info.assignee = assignee.value;
    info.estimate = estimate.value;
    info.state = state.value;
    render();
    document.getElementById('display').style.display = "none";    
});

function render(){
  var display = document.getElementById('info');

  display.innerText = JSON.stringify(info, null, 4);
}

render();