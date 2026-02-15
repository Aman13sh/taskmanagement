import Project from "../models/project.model";
import Column from "../models/coulmns.models";
import Task from "../models/Tasks.modles";

export const applyDatabaseIndexes = async () => {
  try {
    console.log("🔄 Applying database indexes...");

    // Project indexes
    await Project.collection.createIndex(
      { owner: 1 }
    );

    await Project.collection.createIndex(
      { "members.user": 1 }
    );

    // Column indexes
    await Column.collection.createIndex(
      { project: 1, order: 1 }
    );

    // Task indexes
    await Task.collection.createIndex(
      { project: 1, column: 1, order: 1 }
    );

    await Task.collection.createIndex(
      { column: 1 }
    );

    console.log("✅ Database indexes applied successfully");

  } catch (error) {
    console.error("❌ Error applying indexes:", error);
  }
};
