class CreateCssFrameworkRepos < ActiveRecord::Migration[6.1]
  def change
    create_table :css_framework_repos, id: false do |t|
      t.string :id, primary_key: true
      t.string :name
    end
  end
end
