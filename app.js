var budgetController = (function (){

    var Expense = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }

    var Income = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
    }


    var data = {

        allItems:{
            exp: [],
            inc: []
        },
        totals:{
            exp:0,
            inc:0
        },
        budget: 0,
        percentage:-1

    };

    var calculateTotal = function(type){
        var sum = 0;

        data.allItems[type].forEach(element => {
            sum += element.value;
        });

        data.totals[type] = sum;
    }

    return{
        addItem: function(type,des,val){

            var newItem, ID;

            if(data.allItems[type].length > 0){
                ID = data.allItems[type].length;
            }
            else{
                ID= 0
            }

            if(type === 'exp'){
                newItem = new Expense(ID,des,val);
            }    
            else{
                newItem = new Income(ID,des,val); 
            }

            data.allItems[type].push(newItem);

            return newItem;

        },
        calculateBudget:  function(){

            calculateTotal('exp');
            calculateTotal('inc');

            data.budget = data.totals.inc - data.totals.exp;

            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp/data.totals.inc) * 100);
            }
            else{
                data.percentage = -1;
            }
        },
        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },
        deleteItem: function(type, id) {
            var ids, index;
            
            // id = 6
            //data.allItems[type][id];
            // ids = [1 2 4  8]
            //index = 3
            
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
            
        },

    }


})();

var UIController = (function(){

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function(num, type) {
        var numSplit, int, dec, type;
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); //input 23510, output 23,510
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    };
    

    return{

        getInputs: function(){
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },
        getDOMStrings: function(){
            return DOMstrings;
        },
        addListItem: function(obj,type){

            var html, newHtml, element;

            if(type === 'inc'){
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);
            
            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            
        },
        displayBudget:function(obj){
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc);
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp);
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },
        deleteListItem: function(selectorID) {
            
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
            
        },
    }
})();

var controller = (function (budgetCtrl,UICrtl){

    var setupEventListeners = function(){

        var DOM  = UICrtl.getDOMStrings();

        document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        
        document.addEventListener('keypress',function(event){
            if(event.keyCode === 13 || event.which === 13){
                ctrlAddItem();
            }
        });
    };

    var updateBudget = function(){
        budgetCtrl.calculateBudget();
        var budget = budgetCtrl.getBudget();
        console.log(budget);
        UICrtl.displayBudget(budget);
    };
    var updatePercentages=function(){
        for(let j=0; j<data.exp.length;j++)
        {
            data.exp[j].percentage= Mathc.round((data.exp[j].value/data.totals.inc)*100)
        }
    }
    var loadBudgetInfo = function(){
        axios.get("https://api.myjson.com/bins/erk07")
        .then(function(response){
            console.log(response);
            if(response.data !==undefined){
                for(let i=0; i<response.data["exp"].length; i++){
                    obj=response.data["exp"][i];
                    console.log(i+" "+ response.data["exp"][i].value);
                    newItem = budgetCtrl.addItem("exp",obj.description,obj.value);
                    UIController.addListItem(newItem,"exp");

                }
                for(let i=0; i<response.data["inc"].length; i++){
                    obj=response.data["inc"][i];
                    console.log(i+" "+ response.data["inc"][i].value);
                    newItem = budgetCtrl.addItem("inc",obj.description,obj.value);
                    UIController.addListItem(newItem,"inc");

                }
            }
            updateBudget();
        })
    };



    var ctrlAddItem = function(){

        var input, newItem;

        input = UICrtl.getInputs();

        if( input.description !== "" && !isNaN(input.value) && input.value > 0){

            //1. add Item to Data
            newItem = budgetCtrl.addItem(input.type,input.description,input.value);

            //2. Add Item to List   
            UIController.addListItem(newItem,input.type);
        }

        updateBudget();
    };

    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if (itemID) {
            
            //inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            // 1. delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);
            
            // 2. Delete the item from the UI
            UICrtl.deleteListItem(itemID);
            
            // 3. Update and show the new budget
            updateBudget();
            
            // 4. Calculate and update percentages
           
        }
    };

    return {
        init: function() {
            console.log('Application has started.');
            UICrtl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
            loadBudgetInfo();
        }
    };

})(budgetController,UIController);

controller.init();