App.storagePool = App.storagePool || {
    data:[],
    error:false,
    errorMessage:'',
    loading:false,
    initiated:false,
    tableSettings: {
        rowId:'name',
        searching:true,
        responsive: false,
        select: true,
        scrollX: true,
        columnDefs: [
            {
                orderable: false,
                className: 'select-checkbox',
                targets:   0
            }
        ],
        select: {
            style:    'multi',
            selector: 'td:first-child'
        },
        order: [[ 1, 'asc' ]],
    },
    configEditor:null,
    init: function(){
        console.log('Storag Pool init');
        this.configEditor = ace.edit('configEditor');
        this.configEditor.session.setMode('ace/mode/json');
        this.dataTable = $('#tableStoragePools').DataTable(this.tableSettings);
        $('#buttonNewStoragePool').on('click', $.proxy(this.showNewStoragePool, this));
        $('#backStoragePool').on('click', $.proxy(this.backToStoragePools, this));
        $('#buttonCreateStoragePool').on('click', $.proxy(this.createStoragePool, this));
        $('#buttonDeleteStoragePool').on('click', $.proxy(this.deleteStoragePool, this));
        $('#selectAllStoragePools').on('change', $.proxy(this.toggleSelectAll, this, 'Remote'));
        this.dataTable.on('select', $.proxy(this.onItemSelectChange, this));
        this.dataTable.on('deselect', $.proxy(this.onItemSelectChange, this));
        App.setActiveLink('storage');
        this.getData();
    },
    refreshStoragePools: function(e){
        console.log('refreshStorage Pools');
        e.preventDefault();
        console.log('dataTable', this.dataTable);
        this.getData();
    },
    setLoading: function(state){
        this.loading=true;
    },
    getData: function(){
        this.setLoading(true);
        $.get(App.baseAPI+'storage_pool', $.proxy(this.getDataSuccess, this));
    },
    getDataSuccess: function(response){
        console.log('success', response.data);
        this.setLoading(false);
        this.data = response.data;
        if(!this.initiated)
            return this.initiated = true;

        this.updateLocalTable(response.data);
    },
    updateLocalTable: function(jsonData){
        this.data = jsonData;
        $('#tableProfiles').DataTable().clear();
        $('#tableProfiles').DataTable().destroy();
        $('#tableProfiles').DataTable({
            searching:true,
            data : this.data,
            responsive: true,
            columns : [
                {
                    data : null,
                    defaultContent:'<input type="checkbox" class="profiles-check">'
                },
                { data : "name" },
                { data : "description"},
                { data : "devices",  render: function(field){
                    return Object.keys(field).map((name)=>{
                               return '<ul>'+
                               '<h5>'+name+'</h5>'+
                                    Object.keys(field[name]).map((prop)=>{
                                        return '<li>'+prop+':'+field[name][prop]+'</li>'
                                    }).join('')+
                               '</ul>'
                            }).join('');
                    }
                },
                { data : 'used_by' },
            ]
        });
    },
    showNewStoragePool: function() {
        $('#newStoragePool').show();
        $('#storagePoolList').hide();
    },
    backToStoragePools: function() {
        $('#newStoragePool').hide();
        $('#storagePoolList').show();
    },
    createStoragePool: function() {
        console.log('Create Storage Pool...');
        if (this.configEditor.getValue() === '') {
            configValue = {};
        }
        else {
            configValue = JSON.parse(this.configEditor.getValue());
        }

        $.ajax({
            url:App.baseAPI+'storage_pool/',
            type: 'POST',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify({
                name: $('#name').val(),
                config: configValue,
                driver: $('#driver').val(),
            }),
            success: $.proxy(this.onStoragePoolCreate, this)
        });
    },
    onStoragePoolCreate: function(response) {
        console.log(response);
        console.log('updateSuccess:', 'TODO - add alert and refresh local data');
    },
    deleteStoragePool: function() {
        this.dataTable.rows( { selected: true } ).data().map(function(row){
            $.ajax({
                url: App.baseAPI+'storage_pool/' + row['name'],
                type: 'DELETE',
                success: $.proxy(this.onDeleteSuccess, this, row['name'])
            });
        }.bind(this));
    },
    onDeleteSuccess: function(name){
        this.dataTable.row("#"+name).remove().draw();
        $('.success-msg').text('Storage Pool ' + name + ' has been removed');
        var parent = $('.success-msg').parent().toggleClass('hidden');

        setTimeout(function(){
          parent.toggleClass('hidden');
        }, 10000);
    },
    toggleSelectAll:function(name, event){
        if(event.target.checked){
            this.dataTable.rows().select();
        }else{
            this.dataTable.rows().deselect();
        }
    },
    onItemSelectChange : function(e, dt, type, indexes ){
    console.log('argumentss', arguments);
        var state = this.dataTable.rows({selected:true}).count()>0;
        console.log('newState', state);
        $('#selectAllStoragePools').prop('checked', this.dataTable.rows({selected:true}).count()==this.dataTable.rows().count());
        var buttonStates = state?'removeAttr':'attr';
        $('#buttonDeleteStoragePool')[buttonStates]('disabled','disabled');
    }
}