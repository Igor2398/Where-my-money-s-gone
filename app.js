//Budget Controller
var budgetController = ( () => {

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalInc) {
        if (totalInc > 0) {
            this.percentage = Math.round((this.value / totalInc) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculeteTotal = (type) => {
        var sum = 0;
        data.allItems[type].forEach( (cur) => {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };

    var data = {
        budget: 0,
        percentage: -1,  //because percantage does not exist at the beginning

        allItems: {
            exp: [],
            inc: []
        },

        totals: {
            exp: 0,
            inc: 0
        }
    };

    return {
        addItem: (type, des, val) => {
            var newItem, ID = 0;

            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else {
                newItem = new Income(ID, des, val);
            }

            data.allItems[type].push(newItem);
            return newItem;
        },

        deleteItem: (type, id) => {
            var ids, index;
            ids = data.allItems[type].map( (current) => {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: () => {
            calculeteTotal('inc');
            calculeteTotal('exp');

            data.budget = data.totals.inc - data.totals.exp;

            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);    
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentages: () => {

            data.allItems.exp.forEach( (cur) => {   
                cur.calcPercentage(data.totals.inc);
            });

        },

        getPercentages: () => {
            var allPercentages = data.allItems.exp.map( (cur) => {
                return cur.getPercentage();
            });
            return allPercentages;
        },

        getBudget: () => {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        testing: () => {
            console.log(data);
        }
    }
})();

//UI Controller
var UIController = (() => {

    var DOMelements = {
        inputDesc: '.add__description',
        inputVal: '.add__value',
        inputType: '.add__type',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        budgetIncLabel: '.budget__income--value',
        budgetExpLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expPercentageLabel: '.item__percentage',
        dataLabel: '.budget__title--month'
    };

    var formatNumber = (num, type) => {
        var num, numSplit, int, dec, type;
        num = Math.abs(num);
        num = num.toFixed(2);
        
        numSplit = num.split('.');
        int = numSplit[0];

        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        dec = numSplit[1];
        
        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };


    return {

        getInput: () => {
            return {
                desc: document.querySelector(DOMelements.inputDesc).value,

                val: parseFloat(document.querySelector(DOMelements.inputVal).value),

                type: document.querySelector(DOMelements.inputType).value,
            };
        },

        addListItem: (obj, type) => {
            var html, newHtml, element;

            if(type === 'inc') {
                element = DOMelements.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><span>&#10005</span></button></div></div></div>';
            } else {
                element = DOMelements.expensesContainer;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><span class="item__delete--btn__b">&#10005</span></button></div></div></div>';
            }

            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            
        },

        deleteListItem: (ID) => {
            var element = document.getElementById(ID);
            element.parentNode.removeChild(element);
        },

        clearFields: () => {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMelements.inputDesc + ', ' + DOMelements.inputVal);
            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach((current, index, array) => {
                current.value = "";
            });
            fieldsArr[0].focus();
        },

        displayBudget: (obj) => {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMelements.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMelements.budgetIncLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMelements.budgetExpLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if (obj.percentage > 0 && obj.percentage < 1000) {
                document.querySelector(DOMelements.percentageLabel).textContent = obj.percentage + "%";
            } else if (obj.percentage >= 1000) {
                document.querySelector(DOMelements.percentageLabel).textContent = ">999%";
            }
            else {
                document.querySelector(DOMelements.percentageLabel).textContent = "--";
            }

        },

        displayPercentages: (percentages) => {
            var fields;
            fields = document.querySelectorAll(DOMelements.expPercentageLabel);

            var nodeListForEach = (list, callback) => {
                for (var i = 0; i < list.length; i++) {
                    callback(list[i], i);
                }
            };

            nodeListForEach(fields, (current, index) => {

                if (percentages[index] > 0 && percentages[index] < 1000) {
                    current.textContent = percentages[index] + "%";
                } else if (percentages[index] >= 1000) {
                    current.textContent = '>999%';
                } 
                else {
                    current.textContent = '--';
                }
            });

        },

        displayDate: () => {

            const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September",
            "October", "November", "December"];
        
            date = new Date;
            n = date.getMonth();
            document.querySelector(DOMelements.dataLabel).textContent = monthNames[n] + ' ' + date.getFullYear();
        },

        getDOMelements: () => {
            return DOMelements;
        }
    };

})();

//Global App Controller
var controller = ((budgetCtrl, UICtrl) => {


    var setupEventListeners = () => {

        var DOM = UICtrl.getDOMelements();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', (event) => {
            if (event.keyCode === 13 || event.which === 13) { //which is for older browsers
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem)

    };


    var updateBudget = () => {
        
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();

        // 2. Return the budget
        var budget = budgetCtrl.getBudget();

        // 3. Display the budget on the UI
        UIController.displayBudget(budget);
    };

    var updatePercentages = () => {

        budgetCtrl.calculatePercentages();

        var percentages = budgetCtrl.getPercentages();
        
        UICtrl.displayPercentages(percentages);

    };

    var ctrlAddItem = () => {
        var input, newItem;
        // 1. Get the data from input field 
        input = UICtrl.getInput();

        if (input.desc !== "" && !isNaN(input.val) && input.val > 0){
            // 2. Add the item to the bC
            newItem = budgetCtrl.addItem(input.type, input.desc, input.val);
            // 3. Add the item to the UIC
            UICtrl.addListItem(newItem, input.type); 
            // 4. Clear fields from data
            UICtrl.clearFields();
            // 5. Update budget status
            updateBudget();
            // 6. Update percentages
            updatePercentages();
        }
    };

    var ctrlDeleteItem = (event) => {
        var itemID, splitID, type, ID;

        itemID = (event.target.parentNode.parentNode.parentNode.parentNode.id);

        if (itemID) {
            //inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            budgetCtrl.deleteItem(type, ID);

            UICtrl.deleteListItem(itemID);

            updateBudget();

            updatePercentages();

        }
    };

    return {
        init: () => {
            UIController.displayBudget({
                    budget: 0,
                    totalInc: 0,
                    totalExp: 0,
                    percentage: -1
                });
            setupEventListeners();
            
            UICtrl.displayDate();
        }
    }

})(budgetController, UIController);

controller.init();