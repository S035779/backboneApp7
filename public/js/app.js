(function () {
"use strict";

// Backbone.js RESTful sample application #7.
var app = {};

var Memo = Backbone.Model.extend({
  idAttribute: "_id",
  defaults: {
    "title": "",
    "content": ""
  },
  validate: function (attributes) {
    if (attributes.content === "" || attributes.title === "") {
      return "title and content must be not empty.";
    }
  }
});

var MemoList = Backbone.Collection.extend({
  model: Memo,
  url: "/memo"
});

// AppViewの定義
var AppView = Backbone.View.extend({
    events:{
      "click #addBtn":"onAdd"
    },
    initialize:function () {
      _.bindAll(this, 'onAdd', 'render');
 
      this.$title = $("#addForm [name='title']");
      this.$content = $("#addForm [name='content']");
 
      this.collection = new MemoList();
 
      this.listView = new ListView({el:$("#memoList"), collection:this.collection});
 
      this.render();
    },
    render:function () {
      this.$title.val('');
      this.$content.val('');
    },
    onAdd:function () {
      this.collection.create({title:this.$title.val(), content:this.$content.val()}, {wait:true});
      this.render();
    }
});

// Listiewの定義
var ListView = Backbone.View.extend({
    initialize:function () {
        this.listenTo(this.collection, "add", this.addItemView);
        var _this = this;
        this.collection.fetch({reset: true}).done(function () {
            _this.render();
        });
    },
    render:function () {
        this.collection.each(function (item) {
                this.addItemView(item);
        }, this);
        return this;
    },
    addItemView:function (item) {
            this.$el.append(new ItemView({model:item}).render().el);
    }
});

// ItemViewの定義
var ItemView = Backbone.View.extend({
    tmpl:_.template($("#tmpl-itemview").html()),
    events:{
        "click .edit":"onEdit",
        "click .delete":"onDelete"
    },
    initialize:function () {
        _.bindAll(this, 'onEdit', 'onDelete', 'onDestroy', 'render');
        this.listenTo(this.model, "change", this.render);
        this.listenTo(this.model, "destroy", this.onDestroy);
    },
    onEdit:function () {
        app.router.navigate(this.model.get("_id") + "/edit", {trigger:true});
    },
    onDelete:function () {
        this.model.destroy();
    },
    onDestroy:function () {
        this.remove();
    },
    render:function () {
        this.$el.html(this.tmpl(this.model.toJSON()));
        return this;
    }
});

// HeaderViewの定義
var HeaderView = Backbone.View.extend({
    events:{
        "click .create":"onCreate"
    },
    initialize:function () {
        _.bindAll(this, 'onCreate');
    },
    onCreate:function () {
        app.router.navigate("create", {trigger:true});
    }
});
 
// EditViewの定義
var EditView = Backbone.View.extend({
  events: {
    "click #saveBtn": "onSave",
    "click #cancelBtn": "hideView"
  },
  initialize: function () {
    _.bindAll(this, 'render', 'onSave', 'hideView');

    this.$title = $("#editForm [name='title']");
    this.$content = $("#editForm [name='content']");
  },
  render: function () {
    this.$title.val(this.model.get("title"));
    this.$content.val(this.model.get("content"));
    this.$el.show();
  },
  onSave: function () {
    var _this = this;
    this.model.save({title: this.$title.val(), content: this.$content.val()}).done(function () {
      _this.collection.add(_this.model, {merge: true});
    });
    this.hideView();
  },
  hideView: function () {
    this.$el.hide();
    app.router.navigate("", {trigger: true});
  }
});

// AppRouterの定義
var AppRouter = Backbone.Router.extend({
    routes:{
        "":"home",
        "create":"add",
        ":id/edit":"edit"
    },
    initialize:function () {
        _.bindAll(this, 'home', 'add', 'edit');
        this.collection = new MemoList();
        this.headerView = new HeaderView({el:$(".navbar")});
        this.editView = new EditView({el:$("#editForm"), collection:this.collection});
        this.listView = new ListView({el:$("#memoList"), collection:this.collection});
    },
    home:function(){
        this.editView.hideView();
    },
    add:function () {
        this.editView.model = new Memo(null, {collection:this.collection});
        this.editView.render();
    },
    edit:function (id) {
        this.editView.model = this.collection.get(id);
        if (this.editView.model) {
            this.editView.render();
        }
    }
});

//var appView = new AppView({el:$("#main")});
app.router = new AppRouter();
//Backbone.history.start();
Backbone.history.start({pushState:true, root:"/"});
}());
