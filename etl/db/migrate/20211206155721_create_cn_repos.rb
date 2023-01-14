class CreateCnRepos < ActiveRecord::Migration[6.1]
  def change
    create_table :cn_repos, id: false do |t|
      t.string :id, primary_key: true
      t.string :name
      t.string :company
    end
  end
end
